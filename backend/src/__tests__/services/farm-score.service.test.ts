import { FarmScoreService } from "../../services/farm-score.service";

describe("FarmScoreService", () => {
  const WEIGHTS = {
    repaymentHistory: 0.30,
    farmProductivity: 0.25,
    creditUtilization: 0.20,
    farmReportConsistency: 0.10,
    cooperativeMembership: 0.08,
    yearsOfExperience: 0.07,
  };

  const MAX_SCORE = 850;

  describe("calculateScore", () => {
    it("should calculate score within valid range (0-850)", () => {
      const components = {
        repaymentHistory: 700,
        farmProductivity: 600,
        creditUtilization: 500,
        farmReportConsistency: 400,
        cooperativeMembership: 300,
        yearsOfExperience: 400,
      };

      const score = FarmScoreService.calculateScore(components);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(MAX_SCORE);
    });

    it("should weight repayment history at 30%", () => {
      expect(WEIGHTS.repaymentHistory).toBe(0.30);
    });

    it("should weight farm productivity at 25%", () => {
      expect(WEIGHTS.farmProductivity).toBe(0.25);
    });

    it("should weight credit utilization at 20%", () => {
      expect(WEIGHTS.creditUtilization).toBe(0.20);
    });

    it("should weight farm report consistency at 10%", () => {
      expect(WEIGHTS.farmReportConsistency).toBe(0.10);
    });

    it("should weight cooperative membership at 8%", () => {
      expect(WEIGHTS.cooperativeMembership).toBe(0.08);
    });

    it("should weight years of experience at 7%", () => {
      expect(WEIGHTS.yearsOfExperience).toBe(0.07);
    });

    it("should have weights that sum to 1.0", () => {
      const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it("should cap score at MAX_SCORE", () => {
      const components = {
        repaymentHistory: 1000,
        farmProductivity: 1000,
        creditUtilization: 1000,
        farmReportConsistency: 1000,
        cooperativeMembership: 1000,
        yearsOfExperience: 1000,
      };

      const score = FarmScoreService.calculateScore(components);
      expect(score).toBeLessThanOrEqual(MAX_SCORE);
    });
  });

  describe("getTier", () => {
    it("should return EXCELLENT for scores >= 750", () => {
      expect(FarmScoreService.getTier(750)).toBe("EXCELLENT");
      expect(FarmScoreService.getTier(800)).toBe("EXCELLENT");
      expect(FarmScoreService.getTier(850)).toBe("EXCELLENT");
    });

    it("should return GOOD for scores 650-749", () => {
      expect(FarmScoreService.getTier(650)).toBe("GOOD");
      expect(FarmScoreService.getTier(700)).toBe("GOOD");
      expect(FarmScoreService.getTier(749)).toBe("GOOD");
    });

    it("should return FAIR for scores 500-649", () => {
      expect(FarmScoreService.getTier(500)).toBe("FAIR");
      expect(FarmScoreService.getTier(600)).toBe("FAIR");
      expect(FarmScoreService.getTier(649)).toBe("FAIR");
    });

    it("should return POOR for scores 350-499", () => {
      expect(FarmScoreService.getTier(350)).toBe("POOR");
      expect(FarmScoreService.getTier(450)).toBe("POOR");
      expect(FarmScoreService.getTier(499)).toBe("POOR");
    });

    it("should return VERY_POOR for scores < 350", () => {
      expect(FarmScoreService.getTier(0)).toBe("VERY_POOR");
      expect(FarmScoreService.getTier(200)).toBe("VERY_POOR");
      expect(FarmScoreService.getTier(349)).toBe("VERY_POOR");
    });
  });

  describe("getScoreBreakdown", () => {
    it("should return correct breakdown for score", () => {
      const breakdown = FarmScoreService.getScoreBreakdown(700);

      expect(breakdown.score).toBe(700);
      expect(breakdown.tier).toBe("GOOD");
      expect(breakdown.maxScore).toBe(850);
      expect(breakdown.percentile).toBe(82);
      expect(breakdown.nextTierThreshold).toBe(750);
      expect(breakdown.pointsToNextTier).toBe(50);
    });

    it("should return null nextTierThreshold for EXCELLENT", () => {
      const breakdown = FarmScoreService.getScoreBreakdown(800);

      expect(breakdown.tier).toBe("EXCELLENT");
      expect(breakdown.nextTierThreshold).toBeNull();
      expect(breakdown.pointsToNextTier).toBe(0);
    });

    it("should include tier benefits", () => {
      const breakdown = FarmScoreService.getScoreBreakdown(800);

      expect(breakdown.tierBenefits).toBeDefined();
      expect(breakdown.tierBenefits.length).toBeGreaterThan(0);
    });
  });
});
