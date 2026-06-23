import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { logger } from "../config/logger";

interface UssdSession {
  userId?: string;
  borrowerId?: string;
  phone: string;
  level: number;
  data: Record<string, any>;
}

interface UssdRequest {
  sessionId: string;
  phoneNumber: string;
  text: string;
  serviceCode: string;
}

interface UssdResponse {
  response: string;
  endSession: boolean;
}

const SESSION_TTL = 180; // 3 minutes

export class UssdService {
  static async handleSession(req: UssdRequest): Promise<UssdResponse> {
    const sessionKey = `ussd:${req.sessionId}`;
    const inputs = req.text.split("*").filter(Boolean);

    let session = await this.getSession(sessionKey);

    if (!session) {
      session = await this.initSession(req.phoneNumber, sessionKey);
    }

    const response = await this.processInput(session, inputs, sessionKey);

    return response;
  }

  private static async getSession(key: string): Promise<UssdSession | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  private static async saveSession(key: string, session: UssdSession): Promise<void> {
    await redis.setex(key, SESSION_TTL, JSON.stringify(session));
  }

  private static async initSession(phone: string, sessionKey: string): Promise<UssdSession> {
    const normalizedPhone = this.normalizePhone(phone);

    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone, role: "BORROWER" },
      include: { borrowerProfile: true },
    });

    const session: UssdSession = {
      userId: user?.id,
      borrowerId: user?.borrowerProfile?.id,
      phone: normalizedPhone,
      level: 0,
      data: {},
    };

    await this.saveSession(sessionKey, session);
    return session;
  }

  private static async processInput(
    session: UssdSession,
    inputs: string[],
    sessionKey: string
  ): Promise<UssdResponse> {
    const currentInput = inputs[inputs.length - 1] || "";

    if (!session.userId) {
      return this.handleUnregisteredUser(session, currentInput, sessionKey);
    }

    if (inputs.length === 0) {
      return this.showMainMenu(session);
    }

    const menuChoice = inputs[0];

    switch (menuChoice) {
      case "1":
        return this.handleBalance(session);
      case "2":
        return this.handlePayment(session, inputs, sessionKey);
      case "3":
        return this.handleFarmReport(session, inputs, sessionKey);
      case "4":
        return this.handleFarmScore(session);
      case "5":
        return this.handlePrograms(session, inputs);
      case "0":
        return { response: "Thank you for using AgroTrack. Goodbye!", endSession: true };
      default:
        return this.showMainMenu(session);
    }
  }

  private static showMainMenu(session: UssdSession): UssdResponse {
    const menu = `CON Welcome to AgroTrack

1. Check Balance
2. Make Payment
3. Submit Farm Report
4. View FarmScore
5. Browse Programs
0. Exit`;

    return { response: menu, endSession: false };
  }

  private static async handleUnregisteredUser(
    session: UssdSession,
    input: string,
    sessionKey: string
  ): Promise<UssdResponse> {
    if (session.level === 0) {
      session.level = 1;
      await this.saveSession(sessionKey, session);

      return {
        response: `CON Welcome to AgroTrack!
Your phone is not registered.

1. Register as Farmer
2. Contact Support
0. Exit`,
        endSession: false,
      };
    }

    if (input === "1") {
      return {
        response: `END To register:
1. Visit agrotrack.ng/register
2. Or contact a field agent
3. Call: 0800-AGRO-TRACK`,
        endSession: true,
      };
    }

    if (input === "2") {
      return {
        response: `END Contact Support:
Phone: 0800-AGRO-TRACK
WhatsApp: +234 800 123 4567
Email: support@agrotrack.ng`,
        endSession: true,
      };
    }

    return { response: "END Thank you. Goodbye!", endSession: true };
  }

  private static async handleBalance(session: UssdSession): Promise<UssdResponse> {
    const loans = await prisma.borrowerLoan.findMany({
      where: { borrowerId: session.borrowerId, status: "ACTIVE" },
      include: { program: { select: { name: true } } },
    });

    if (loans.length === 0) {
      return { response: "END You have no active loans.", endSession: true };
    }

    let message = "END Your Active Loans:\n\n";

    for (const loan of loans) {
      const remaining = Number(loan.totalRepayable) - Number(loan.amountPaid);
      message += `${loan.program.name}\n`;
      message += `Remaining: NGN ${remaining.toLocaleString()}\n`;
      message += `Next due: ${loan.nextPaymentDate?.toLocaleDateString() || "N/A"}\n\n`;
    }

    return { response: message, endSession: true };
  }

  private static async handlePayment(
    session: UssdSession,
    inputs: string[],
    sessionKey: string
  ): Promise<UssdResponse> {
    if (inputs.length === 1) {
      const loans = await prisma.borrowerLoan.findMany({
        where: { borrowerId: session.borrowerId, status: "ACTIVE" },
        include: { program: { select: { name: true } } },
      });

      if (loans.length === 0) {
        return { response: "END You have no active loans to pay.", endSession: true };
      }

      let menu = "CON Select loan to pay:\n\n";
      loans.forEach((loan, i) => {
        const due = Number(loan.totalRepayable) - Number(loan.amountPaid);
        menu += `${i + 1}. ${loan.program.name} (NGN ${due.toLocaleString()})\n`;
      });
      menu += "\n0. Back";

      session.data.loans = loans.map((l) => l.id);
      await this.saveSession(sessionKey, session);

      return { response: menu, endSession: false };
    }

    if (inputs.length === 2) {
      const loanIndex = parseInt(inputs[1]) - 1;
      if (inputs[1] === "0") return this.showMainMenu(session);

      if (loanIndex < 0 || loanIndex >= (session.data.loans?.length || 0)) {
        return { response: "END Invalid selection.", endSession: true };
      }

      session.data.selectedLoan = session.data.loans[loanIndex];
      await this.saveSession(sessionKey, session);

      return {
        response: "CON Enter amount to pay (NGN):",
        endSession: false,
      };
    }

    if (inputs.length === 3) {
      const amount = parseInt(inputs[2]);
      if (isNaN(amount) || amount < 100) {
        return { response: "END Invalid amount. Minimum is NGN 100.", endSession: true };
      }

      // In production, integrate with payment gateway
      const ref = `USSD-${Date.now()}`;

      return {
        response: `END Payment Initiated!

Amount: NGN ${amount.toLocaleString()}
Ref: ${ref}

You will receive an SMS with payment instructions.

Dial *966*amount# to complete via bank USSD.`,
        endSession: true,
      };
    }

    return this.showMainMenu(session);
  }

  private static async handleFarmReport(
    session: UssdSession,
    inputs: string[],
    sessionKey: string
  ): Promise<UssdResponse> {
    if (inputs.length === 1) {
      return {
        response: `CON Farm Report Type:

1. Growth Update
2. Harvest Report
3. Problem/Issue
4. Weather Damage
0. Back`,
        endSession: false,
      };
    }

    if (inputs.length === 2) {
      const types = ["GROWTH_UPDATE", "HARVEST", "ISSUE", "WEATHER_DAMAGE"];
      const typeIndex = parseInt(inputs[1]) - 1;

      if (inputs[1] === "0") return this.showMainMenu(session);
      if (typeIndex < 0 || typeIndex >= types.length) {
        return { response: "END Invalid selection.", endSession: true };
      }

      session.data.reportType = types[typeIndex];
      await this.saveSession(sessionKey, session);

      return {
        response: `CON Crop Health (1-5):

1. Very Poor
2. Poor
3. Fair
4. Good
5. Excellent`,
        endSession: false,
      };
    }

    if (inputs.length === 3) {
      const health = parseInt(inputs[2]);
      if (health < 1 || health > 5) {
        return { response: "END Invalid rating.", endSession: true };
      }

      // Create farm report
      await prisma.farmReport.create({
        data: {
          borrowerId: session.borrowerId!,
          type: session.data.reportType,
          title: `USSD Report - ${session.data.reportType}`,
          healthRating: health,
          status: "PENDING",
        },
      });

      logger.info("USSD farm report created", {
        borrowerId: session.borrowerId,
        type: session.data.reportType,
      });

      return {
        response: `END Farm report submitted!

Type: ${session.data.reportType}
Health: ${health}/5

A field agent may visit to verify.
Thank you!`,
        endSession: true,
      };
    }

    return this.showMainMenu(session);
  }

  private static async handleFarmScore(session: UssdSession): Promise<UssdResponse> {
    const profile = await prisma.borrowerProfile.findUnique({
      where: { id: session.borrowerId },
      select: { farmScore: true, farmScoreTier: true },
    });

    if (!profile) {
      return { response: "END Profile not found.", endSession: true };
    }

    const tips = this.getScoreTips(profile.farmScoreTier);

    return {
      response: `END Your FarmScore

Score: ${profile.farmScore}/850
Grade: ${profile.farmScoreTier}

${tips}

Submit reports & pay on time to improve!`,
      endSession: true,
    };
  }

  private static async handlePrograms(
    session: UssdSession,
    inputs: string[]
  ): Promise<UssdResponse> {
    const profile = await prisma.borrowerProfile.findUnique({
      where: { id: session.borrowerId },
      select: { farmScore: true, state: true, primaryCrop: true },
    });

    if (!profile) {
      return { response: "END Profile not found.", endSession: true };
    }

    const programs = await prisma.program.findMany({
      where: {
        status: "ACTIVE",
        requiredScore: { lte: profile.farmScore },
        OR: [
          { targetStates: { has: profile.state } },
          { targetStates: { isEmpty: true } },
        ],
      },
      take: 5,
      select: {
        name: true,
        interestRate: true,
        maxAmount: true,
        durationMonths: true,
      },
    });

    if (programs.length === 0) {
      return {
        response: `END No programs available for your profile.

Improve your FarmScore to access more programs!`,
        endSession: true,
      };
    }

    let message = "END Available Programs:\n\n";

    for (const p of programs) {
      message += `${p.name}\n`;
      message += `Up to NGN ${Number(p.maxAmount).toLocaleString()}\n`;
      message += `${p.interestRate}% for ${p.durationMonths}mo\n\n`;
    }

    message += "Visit agrotrack.ng to apply!";

    return { response: message, endSession: true };
  }

  private static getScoreTips(tier: string): string {
    const tips: Record<string, string> = {
      EXCELLENT: "You qualify for the best rates!",
      GOOD: "Great score! Keep it up.",
      FAIR: "Tip: Join a cooperative for bonus points.",
      POOR: "Submit farm reports to improve.",
      VERY_POOR: "Contact support for assistance.",
    };
    return tips[tier] || "";
  }

  private static normalizePhone(phone: string): string {
    let normalized = phone.replace(/\D/g, "");
    if (normalized.startsWith("234")) {
      normalized = "0" + normalized.slice(3);
    }
    if (!normalized.startsWith("0")) {
      normalized = "0" + normalized;
    }
    return normalized;
  }
}
