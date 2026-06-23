import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";

interface PaystackResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyResponse {
  status: boolean;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    metadata: any;
  };
}

interface PaystackTransferRecipient {
  recipient_code: string;
  name: string;
  type: string;
}

export class PaystackService {
  private static baseUrl = "https://api.paystack.co";

  private static get headers() {
    if (!env.PAYSTACK_SECRET_KEY) throw ApiError.internal("Paystack not configured");
    return {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
  }

  static async initializeTransaction(data: {
    email: string;
    amount: number;
    reference: string;
    metadata?: Record<string, any>;
    callbackUrl?: string;
  }): Promise<PaystackInitResponse> {
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        email: data.email,
        amount: data.amount * 100, // Convert to kobo
        reference: data.reference,
        metadata: data.metadata,
        callback_url: data.callbackUrl || `${env.FRONTEND_URL}/payment/callback`,
      }),
    });

    const result = (await response.json()) as PaystackResponse<PaystackInitResponse>;
    if (!result.status) {
      logger.error("Paystack init failed", { error: result.message });
      throw ApiError.badRequest("Payment initialization failed");
    }

    return result.data;
  }

  static async verifyTransaction(reference: string): Promise<PaystackVerifyResponse["data"]> {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      headers: this.headers,
    });

    const result = (await response.json()) as PaystackResponse<PaystackVerifyResponse["data"]>;
    if (!result.status) {
      logger.error("Paystack verify failed", { reference, error: result.message });
      throw ApiError.badRequest("Transaction verification failed");
    }

    return result.data;
  }

  static async createTransferRecipient(data: {
    name: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<PaystackTransferRecipient> {
    const response = await fetch(`${this.baseUrl}/transferrecipient`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        type: "nuban",
        name: data.name,
        account_number: data.accountNumber,
        bank_code: data.bankCode,
        currency: "NGN",
      }),
    });

    const result = (await response.json()) as PaystackResponse<PaystackTransferRecipient>;
    if (!result.status) {
      logger.error("Paystack recipient creation failed", { error: result.message });
      throw ApiError.badRequest("Failed to create transfer recipient");
    }

    return result.data;
  }

  static async initiateTransfer(data: {
    amount: number;
    recipientCode: string;
    reference: string;
    reason?: string;
  }): Promise<{ transfer_code: string; reference: string }> {
    const response = await fetch(`${this.baseUrl}/transfer`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        source: "balance",
        amount: data.amount * 100,
        recipient: data.recipientCode,
        reference: data.reference,
        reason: data.reason || "AgroTrack loan disbursement",
      }),
    });

    const result = (await response.json()) as PaystackResponse<{ transfer_code: string; reference: string }>;
    if (!result.status) {
      logger.error("Paystack transfer failed", { error: result.message });
      throw ApiError.badRequest("Transfer initiation failed");
    }

    return result.data;
  }

  static async listBanks(): Promise<Array<{ name: string; code: string }>> {
    const response = await fetch(`${this.baseUrl}/bank?country=nigeria`, {
      headers: this.headers,
    });

    const result = (await response.json()) as PaystackResponse<Array<{ name: string; code: string }>>;
    return result.data || [];
  }

  static async resolveAccount(accountNumber: string, bankCode: string): Promise<{ account_name: string; account_number: string }> {
    const response = await fetch(
      `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: this.headers }
    );

    const result = (await response.json()) as PaystackResponse<{ account_name: string; account_number: string }>;
    if (!result.status) {
      throw ApiError.badRequest("Could not resolve account number");
    }

    return result.data;
  }

  static verifyWebhookSignature(body: string, signature: string): boolean {
    if (!env.PAYSTACK_SECRET_KEY) return false;
    const hash = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");
    return hash === signature;
  }

  static generateReference(prefix = "ATK"): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString("hex");
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }
}
