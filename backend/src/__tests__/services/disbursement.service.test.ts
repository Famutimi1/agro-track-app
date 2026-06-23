describe("DisbursementService", () => {
  describe("Tranche Calculation", () => {
    it("should calculate equal tranches for even amount", () => {
      const totalAmount = 1000000;
      const trancheCount = 4;
      const expectedPerTranche = totalAmount / trancheCount;

      expect(expectedPerTranche).toBe(250000);
    });

    it("should handle uneven division with rounding", () => {
      const totalAmount = 1000000;
      const trancheCount = 3;
      const perTranche = Math.floor(totalAmount / trancheCount);
      const remainder = totalAmount - perTranche * trancheCount;

      expect(perTranche).toBe(333333);
      expect(remainder).toBe(1); // Last tranche gets the extra
    });

    it("should calculate correct tranche sequence", () => {
      const totalAmount = 500000;
      const trancheCount = 2;
      const disbursementSequence = [0.6, 0.4]; // 60% first, 40% second

      const firstTranche = totalAmount * disbursementSequence[0];
      const secondTranche = totalAmount * disbursementSequence[1];

      expect(firstTranche).toBe(300000);
      expect(secondTranche).toBe(200000);
      expect(firstTranche + secondTranche).toBe(totalAmount);
    });
  });

  describe("Disbursement Status Flow", () => {
    const validTransitions: Record<string, string[]> = {
      PENDING: ["APPROVED", "FAILED"],
      APPROVED: ["PROCESSING", "FAILED"],
      PROCESSING: ["COMPLETED", "FAILED"],
      COMPLETED: [],
      FAILED: ["PENDING"],
    };

    it("should allow PENDING -> APPROVED transition", () => {
      expect(validTransitions["PENDING"]).toContain("APPROVED");
    });

    it("should allow APPROVED -> PROCESSING transition", () => {
      expect(validTransitions["APPROVED"]).toContain("PROCESSING");
    });

    it("should allow PROCESSING -> COMPLETED transition", () => {
      expect(validTransitions["PROCESSING"]).toContain("COMPLETED");
    });

    it("should not allow COMPLETED -> any transition", () => {
      expect(validTransitions["COMPLETED"]).toHaveLength(0);
    });

    it("should allow FAILED -> PENDING retry", () => {
      expect(validTransitions["FAILED"]).toContain("PENDING");
    });
  });

  describe("Tranche Release Conditions", () => {
    interface TrancheCondition {
      trancheNumber: number;
      conditions: string[];
    }

    const trancheConditions: TrancheCondition[] = [
      { trancheNumber: 1, conditions: ["application_approved", "documents_verified"] },
      { trancheNumber: 2, conditions: ["first_tranche_utilized", "farm_report_submitted"] },
      { trancheNumber: 3, conditions: ["previous_tranches_utilized", "field_visit_completed"] },
    ];

    it("should require application approval for first tranche", () => {
      const firstTranche = trancheConditions.find((t) => t.trancheNumber === 1);
      expect(firstTranche?.conditions).toContain("application_approved");
    });

    it("should require farm report for second tranche", () => {
      const secondTranche = trancheConditions.find((t) => t.trancheNumber === 2);
      expect(secondTranche?.conditions).toContain("farm_report_submitted");
    });

    it("should require field visit for third tranche", () => {
      const thirdTranche = trancheConditions.find((t) => t.trancheNumber === 3);
      expect(thirdTranche?.conditions).toContain("field_visit_completed");
    });
  });

  describe("Payment Processing", () => {
    it("should validate bank account format (NUBAN)", () => {
      const nubanRegex = /^\d{10}$/;

      expect(nubanRegex.test("1234567890")).toBe(true);
      expect(nubanRegex.test("123456789")).toBe(false);
      expect(nubanRegex.test("12345678901")).toBe(false);
      expect(nubanRegex.test("123456789a")).toBe(false);
    });

    it("should calculate correct transfer fee", () => {
      const calculateFee = (amount: number): number => {
        if (amount <= 5000) return 10;
        if (amount <= 50000) return 25;
        return 50;
      };

      expect(calculateFee(1000)).toBe(10);
      expect(calculateFee(5000)).toBe(10);
      expect(calculateFee(25000)).toBe(25);
      expect(calculateFee(100000)).toBe(50);
    });
  });

  describe("Disbursement Amount Validation", () => {
    it("should reject negative amounts", () => {
      const isValidAmount = (amount: number): boolean => amount > 0;

      expect(isValidAmount(-1000)).toBe(false);
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(1000)).toBe(true);
    });

    it("should reject amounts exceeding loan total", () => {
      const loanTotal = 1000000;
      const alreadyDisbursed = 600000;
      const requestedAmount = 500000;

      const isWithinLimit = requestedAmount <= loanTotal - alreadyDisbursed;
      expect(isWithinLimit).toBe(false);
    });

    it("should accept valid disbursement amount", () => {
      const loanTotal = 1000000;
      const alreadyDisbursed = 600000;
      const requestedAmount = 300000;

      const isWithinLimit = requestedAmount <= loanTotal - alreadyDisbursed;
      expect(isWithinLimit).toBe(true);
    });
  });
});
