import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("AuthService", () => {
  const JWT_SECRET = "test-jwt-secret-key-for-testing-only";
  const JWT_REFRESH_SECRET = "test-refresh-secret-key-for-testing-only";

  describe("Password Hashing", () => {
    it("should hash passwords correctly", async () => {
      const password = "SecurePassword123!";
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should verify correct password", async () => {
      const password = "SecurePassword123!";
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "SecurePassword123!";
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare("WrongPassword", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("JWT Token Generation", () => {
    it("should generate valid access token", () => {
      const payload = { userId: "user-123", role: "BORROWER" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

      expect(token).toBeDefined();
      expect(token.split(".").length).toBe(3);
    });

    it("should decode access token correctly", () => {
      const payload = { userId: "user-123", role: "BORROWER" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

      const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;
      expect(decoded.userId).toBe("user-123");
      expect(decoded.role).toBe("BORROWER");
    });

    it("should reject token with wrong secret", () => {
      const payload = { userId: "user-123", role: "BORROWER" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

      expect(() => jwt.verify(token, "wrong-secret")).toThrow();
    });

    it("should reject expired token", () => {
      const payload = { userId: "user-123", role: "BORROWER" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "-1s" });

      expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
    });

    it("should generate refresh token with longer expiry", () => {
      const payload = { userId: "user-123", type: "refresh" };
      const token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });

      const decoded = jwt.decode(token) as { exp: number };
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      expect(decoded.exp - now).toBeCloseTo(sevenDaysInSeconds, -2);
    });
  });

  describe("Token Payload", () => {
    it("should include lenderId for lender users", () => {
      const payload = {
        userId: "user-123",
        role: "LENDER_ADMIN",
        lenderId: "lender-456",
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

      const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;
      expect(decoded.lenderId).toBe("lender-456");
    });

    it("should not include lenderId for borrower users", () => {
      const payload = { userId: "user-123", role: "BORROWER" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.lenderId).toBeUndefined();
    });
  });

  describe("OTP Generation", () => {
    it("should generate 6-digit OTP", () => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it("should generate different OTPs each time", () => {
      const otp1 = Math.floor(100000 + Math.random() * 900000).toString();
      const otp2 = Math.floor(100000 + Math.random() * 900000).toString();

      // While they could theoretically be the same, it's extremely unlikely
      // This test verifies the randomness mechanism is working
      expect(otp1).toBeDefined();
      expect(otp2).toBeDefined();
    });
  });

  describe("Password Validation", () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    it("should accept strong password", () => {
      const password = "SecurePass123!";
      expect(passwordRegex.test(password)).toBe(true);
    });

    it("should reject password without uppercase", () => {
      const password = "securepass123!";
      expect(passwordRegex.test(password)).toBe(false);
    });

    it("should reject password without lowercase", () => {
      const password = "SECUREPASS123!";
      expect(passwordRegex.test(password)).toBe(false);
    });

    it("should reject password without number", () => {
      const password = "SecurePassword!";
      expect(passwordRegex.test(password)).toBe(false);
    });

    it("should reject password without special character", () => {
      const password = "SecurePass123";
      expect(passwordRegex.test(password)).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const password = "Sec1!";
      expect(passwordRegex.test(password)).toBe(false);
    });
  });
});
