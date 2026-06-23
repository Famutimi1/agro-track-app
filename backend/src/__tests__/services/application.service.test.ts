describe("ApplicationService", () => {
  describe("Application Status Flow", () => {
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["SUBMITTED", "CANCELLED"],
      SUBMITTED: ["UNDER_REVIEW", "REJECTED", "CANCELLED"],
      UNDER_REVIEW: ["APPROVED", "REJECTED"],
      APPROVED: ["DISBURSED"],
      REJECTED: [],
      DISBURSED: [],
      CANCELLED: [],
    };

    it("should allow DRAFT -> SUBMITTED transition", () => {
      expect(validTransitions["DRAFT"]).toContain("SUBMITTED");
    });

    it("should allow SUBMITTED -> UNDER_REVIEW transition", () => {
      expect(validTransitions["SUBMITTED"]).toContain("UNDER_REVIEW");
    });

    it("should allow UNDER_REVIEW -> APPROVED transition", () => {
      expect(validTransitions["UNDER_REVIEW"]).toContain("APPROVED");
    });

    it("should allow UNDER_REVIEW -> REJECTED transition", () => {
      expect(validTransitions["UNDER_REVIEW"]).toContain("REJECTED");
    });

    it("should not allow any transition from REJECTED", () => {
      expect(validTransitions["REJECTED"]).toHaveLength(0);
    });

    it("should not allow any transition from DISBURSED", () => {
      expect(validTransitions["DISBURSED"]).toHaveLength(0);
    });

    it("should validate transition is allowed", () => {
      const canTransition = (from: string, to: string): boolean => {
        return validTransitions[from]?.includes(to) ?? false;
      };

      expect(canTransition("DRAFT", "SUBMITTED")).toBe(true);
      expect(canTransition("DRAFT", "APPROVED")).toBe(false);
      expect(canTransition("REJECTED", "SUBMITTED")).toBe(false);
    });
  });

  describe("Eligibility Checks", () => {
    interface EligibilityResult {
      eligible: boolean;
      reasons: string[];
    }

    const checkEligibility = (params: {
      farmScore: number;
      minScore: number;
      hasActiveLoans: boolean;
      documentsComplete: boolean;
      bvnVerified: boolean;
    }): EligibilityResult => {
      const reasons: string[] = [];

      if (params.farmScore < params.minScore) {
        reasons.push(`Farm score ${params.farmScore} below minimum ${params.minScore}`);
      }
      if (params.hasActiveLoans) {
        reasons.push("Has existing active loans");
      }
      if (!params.documentsComplete) {
        reasons.push("Required documents incomplete");
      }
      if (!params.bvnVerified) {
        reasons.push("BVN not verified");
      }

      return {
        eligible: reasons.length === 0,
        reasons,
      };
    };

    it("should approve eligible borrower", () => {
      const result = checkEligibility({
        farmScore: 700,
        minScore: 600,
        hasActiveLoans: false,
        documentsComplete: true,
        bvnVerified: true,
      });

      expect(result.eligible).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it("should reject borrower with low farm score", () => {
      const result = checkEligibility({
        farmScore: 500,
        minScore: 600,
        hasActiveLoans: false,
        documentsComplete: true,
        bvnVerified: true,
      });

      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain("Farm score 500 below minimum 600");
    });

    it("should reject borrower with active loans", () => {
      const result = checkEligibility({
        farmScore: 700,
        minScore: 600,
        hasActiveLoans: true,
        documentsComplete: true,
        bvnVerified: true,
      });

      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain("Has existing active loans");
    });

    it("should reject borrower without BVN verification", () => {
      const result = checkEligibility({
        farmScore: 700,
        minScore: 600,
        hasActiveLoans: false,
        documentsComplete: true,
        bvnVerified: false,
      });

      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain("BVN not verified");
    });

    it("should list all ineligibility reasons", () => {
      const result = checkEligibility({
        farmScore: 500,
        minScore: 600,
        hasActiveLoans: true,
        documentsComplete: false,
        bvnVerified: false,
      });

      expect(result.eligible).toBe(false);
      expect(result.reasons).toHaveLength(4);
    });
  });

  describe("Amount Validation", () => {
    interface ProgramLimits {
      minAmount: number;
      maxAmount: number;
    }

    const validateAmount = (
      amount: number,
      limits: ProgramLimits,
      farmScore: number
    ): { valid: boolean; maxAllowed: number } => {
      // Higher farm scores allow higher percentages of max
      let scoreMultiplier = 1.0;
      if (farmScore < 600) scoreMultiplier = 0.5;
      else if (farmScore < 700) scoreMultiplier = 0.75;
      else if (farmScore < 800) scoreMultiplier = 0.9;

      const maxAllowed = Math.floor(limits.maxAmount * scoreMultiplier);
      const valid = amount >= limits.minAmount && amount <= maxAllowed;

      return { valid, maxAllowed };
    };

    it("should allow amount within limits for high score", () => {
      const result = validateAmount(
        500000,
        { minAmount: 100000, maxAmount: 1000000 },
        800
      );

      expect(result.valid).toBe(true);
      expect(result.maxAllowed).toBe(1000000);
    });

    it("should limit amount for low farm score", () => {
      const result = validateAmount(
        800000,
        { minAmount: 100000, maxAmount: 1000000 },
        550
      );

      expect(result.valid).toBe(false);
      expect(result.maxAllowed).toBe(500000);
    });

    it("should reject amount below minimum", () => {
      const result = validateAmount(
        50000,
        { minAmount: 100000, maxAmount: 1000000 },
        800
      );

      expect(result.valid).toBe(false);
    });
  });

  describe("Application Reference Generation", () => {
    it("should generate unique reference numbers", () => {
      const generateRef = () => `APP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const ref1 = generateRef();
      const ref2 = generateRef();

      expect(ref1).toMatch(/^APP-\d+-[A-Z0-9]+$/);
      expect(ref1).not.toBe(ref2);
    });
  });
});
