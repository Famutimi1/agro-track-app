import crypto from "crypto";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { env } from "../config/env";

interface WhatsAppMessage {
  from: string;
  type: string;
  text?: { body: string };
  image?: { id: string; caption?: string };
  timestamp: string;
}

interface WhatsAppWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { phone_number_id: string };
        messages?: WhatsAppMessage[];
        statuses?: any[];
      };
    }>;
  }>;
}

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

export class WhatsAppService {
  private static phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  private static accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  private static verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  private static appSecret = process.env.WHATSAPP_APP_SECRET;

  static verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === "subscribe" && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  static verifySignature(payload: string, signature: string): boolean {
    if (!this.appSecret) return false;

    const expectedSig = crypto
      .createHmac("sha256", this.appSecret)
      .update(payload)
      .digest("hex");

    return `sha256=${expectedSig}` === signature;
  }

  static async handleWebhook(data: WhatsAppWebhook): Promise<void> {
    for (const entry of data.entry) {
      for (const change of entry.changes) {
        const messages = change.value.messages;
        if (!messages) continue;

        for (const message of messages) {
          await this.processMessage(message);
        }
      }
    }
  }

  private static async processMessage(message: WhatsAppMessage): Promise<void> {
    const phone = this.normalizePhone(message.from);

    const user = await prisma.user.findFirst({
      where: { phone, role: "BORROWER" },
      include: { borrowerProfile: true },
    });

    if (message.type === "text" && message.text) {
      const text = message.text.body.toLowerCase().trim();
      await this.handleTextMessage(phone, text, user);
    } else if (message.type === "image" && message.image) {
      await this.handleImageMessage(phone, message.image, user);
    }
  }

  private static async handleTextMessage(phone: string, text: string, user: any): Promise<void> {
    if (!user) {
      await this.sendMessage(phone, this.getUnregisteredResponse());
      return;
    }

    const intent = this.detectIntent(text);

    switch (intent) {
      case "balance":
        await this.sendBalanceInfo(phone, user.borrowerProfile.id);
        break;
      case "score":
        await this.sendFarmScore(phone, user.borrowerProfile);
        break;
      case "pay":
        await this.sendPaymentInfo(phone, user.borrowerProfile.id);
        break;
      case "programs":
        await this.sendProgramsInfo(phone, user.borrowerProfile);
        break;
      case "report":
        await this.sendReportPrompt(phone);
        break;
      case "help":
      default:
        await this.sendHelpMenu(phone, user.borrowerProfile.user?.firstName);
        break;
    }
  }

  private static async handleImageMessage(phone: string, image: any, user: any): Promise<void> {
    if (!user) {
      await this.sendMessage(phone, "Please register first to submit farm photos.");
      return;
    }

    // Create farm report from photo
    await prisma.farmReport.create({
      data: {
        borrowerId: user.borrowerProfile.id,
        type: "PHOTO_UPDATE",
        title: image.caption || "WhatsApp Photo Report",
        description: "Submitted via WhatsApp",
        status: "PENDING",
      },
    });

    await this.sendMessage(
      phone,
      "📸 Photo received! Your farm report has been submitted for review. A field agent may contact you for verification."
    );

    logger.info("WhatsApp photo report received", { phone, borrowerId: user.borrowerProfile.id });
  }

  private static detectIntent(text: string): string {
    const intents: Record<string, string[]> = {
      balance: ["balance", "loan", "owe", "remaining", "debt", "status"],
      score: ["score", "farmscore", "rating", "grade"],
      pay: ["pay", "payment", "repay", "transfer"],
      programs: ["program", "loan program", "apply", "new loan", "borrow"],
      report: ["report", "farm report", "update", "harvest", "crop"],
      help: ["help", "menu", "hi", "hello", "start"],
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return intent;
      }
    }

    return "help";
  }

  private static async sendBalanceInfo(phone: string, borrowerId: string): Promise<void> {
    const loans = await prisma.borrowerLoan.findMany({
      where: { borrowerId, status: "ACTIVE" },
      include: { program: { select: { name: true } } },
    });

    if (loans.length === 0) {
      await this.sendMessage(phone, "✅ You have no active loans.");
      return;
    }

    let message = "📊 *Your Active Loans*\n\n";

    for (const loan of loans) {
      const remaining = Number(loan.totalRepayable) - Number(loan.amountPaid);
      const nextDue = loan.nextPaymentDate
        ? loan.nextPaymentDate.toLocaleDateString("en-NG")
        : "N/A";

      message += `*${loan.program.name}*\n`;
      message += `├ Remaining: ₦${remaining.toLocaleString()}\n`;
      message += `├ Next Due: ${nextDue}\n`;
      message += `└ Status: ${loan.status}\n\n`;
    }

    message += "_Reply *pay* to make a payment_";

    await this.sendMessage(phone, message);
  }

  private static async sendFarmScore(phone: string, profile: any): Promise<void> {
    const tierEmoji: Record<string, string> = {
      EXCELLENT: "🌟",
      GOOD: "✨",
      FAIR: "👍",
      POOR: "📈",
      VERY_POOR: "💪",
    };

    const message = `🌾 *Your FarmScore*

Score: *${profile.farmScore}/850*
Grade: ${tierEmoji[profile.farmScoreTier] || ""} ${profile.farmScoreTier}

📈 *Tips to Improve:*
• Pay on time
• Submit regular farm reports
• Join a cooperative

_A higher score = better loan terms!_`;

    await this.sendMessage(phone, message);
  }

  private static async sendPaymentInfo(phone: string, borrowerId: string): Promise<void> {
    const loan = await prisma.borrowerLoan.findFirst({
      where: { borrowerId, status: "ACTIVE" },
      orderBy: { nextPaymentDate: "asc" },
    });

    if (!loan) {
      await this.sendMessage(phone, "You have no active loans to pay.");
      return;
    }

    const remaining = Number(loan.totalRepayable) - Number(loan.amountPaid);

    const message = `💳 *Payment Options*

Outstanding: ₦${remaining.toLocaleString()}

*Bank Transfer:*
Bank: First Bank
Account: 1234567890
Name: AgroTrack Loans

*USSD:*
Dial *966*amount# from your bank

*Online:*
Visit agrotrack.ng/pay

_Use your phone number as reference_`;

    await this.sendMessage(phone, message);
  }

  private static async sendProgramsInfo(phone: string, profile: any): Promise<void> {
    const programs = await prisma.program.findMany({
      where: {
        status: "ACTIVE",
        requiredScore: { lte: profile.farmScore },
      },
      take: 3,
    });

    if (programs.length === 0) {
      await this.sendMessage(
        phone,
        "No programs match your current profile. Improve your FarmScore to unlock more options!"
      );
      return;
    }

    let message = "🌱 *Available Loan Programs*\n\n";

    for (const p of programs) {
      message += `*${p.name}*\n`;
      message += `├ Up to ₦${Number(p.maxAmount).toLocaleString()}\n`;
      message += `├ ${p.interestRate}% interest\n`;
      message += `└ ${p.durationMonths} months\n\n`;
    }

    message += "_Visit agrotrack.ng to apply_";

    await this.sendMessage(phone, message);
  }

  private static async sendReportPrompt(phone: string): Promise<void> {
    const message = `📝 *Submit Farm Report*

Send a photo of your farm with a caption describing:
• Crop growth stage
• Any issues or problems
• Weather conditions

Or type a description and we'll record it.

_Regular reports improve your FarmScore!_`;

    await this.sendMessage(phone, message);
  }

  private static async sendHelpMenu(phone: string, name?: string): Promise<void> {
    const greeting = name ? `Hi ${name}! ` : "Welcome! ";

    const message = `${greeting}🌾 *AgroTrack Bot*

Type any of these commands:

📊 *balance* - Check loan status
💳 *pay* - Payment options
🌟 *score* - View FarmScore
🌱 *programs* - Available loans
📝 *report* - Submit farm update
📸 Send a *photo* for farm report

_Need help? Call 0800-AGRO-TRACK_`;

    await this.sendMessage(phone, message);
  }

  private static getUnregisteredResponse(): string {
    return `Welcome to AgroTrack! 🌾

Your number is not registered.

To get started:
1. Visit agrotrack.ng/register
2. Contact a field agent
3. Call 0800-AGRO-TRACK

_Already registered? Make sure you're using the same phone number._`;
  }

  static async sendMessage(to: string, text: string): Promise<void> {
    if (!this.phoneNumberId || !this.accessToken) {
      logger.warn("WhatsApp not configured, skipping message", { to });
      return;
    }

    try {
      await fetch(`${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      });

      logger.info("WhatsApp message sent", { to });
    } catch (err) {
      logger.error("Failed to send WhatsApp message", { to, error: (err as Error).message });
    }
  }

  private static normalizePhone(phone: string): string {
    let normalized = phone.replace(/\D/g, "");
    if (normalized.startsWith("234")) {
      normalized = "0" + normalized.slice(3);
    }
    return normalized;
  }
}
