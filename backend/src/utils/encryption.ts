import crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const keySource = env.JWT_SECRET;
  return crypto.scryptSync(keySource, "agrotrack-pii-salt", 32);
}

export function encryptPii(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (all hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptPii(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function hashPii(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function maskBvn(bvn: string): string {
  if (!bvn || bvn.length < 6) return "***";
  return bvn.slice(0, 3) + "*".repeat(5) + bvn.slice(-3);
}

export function maskNin(nin: string): string {
  if (!nin || nin.length < 6) return "***";
  return nin.slice(0, 3) + "*".repeat(5) + nin.slice(-3);
}

export function maskAccountNumber(account: string): string {
  if (!account || account.length < 6) return "***";
  return "*".repeat(account.length - 4) + account.slice(-4);
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return "***";
  return phone.slice(0, 4) + "*".repeat(phone.length - 7) + phone.slice(-3);
}
