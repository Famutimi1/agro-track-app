import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

interface MapFilters {
  programId?: string;
  status?: string;
  state?: string;
  minFarmScore?: number;
  maxFarmScore?: number;
  crop?: string;
  cooperativeId?: string;
}

interface BorrowerLocation {
  id: string;
  farmerId: string;
  name: string;
  lat: number;
  lng: number;
  state: string;
  lga: string;
  farmScore: number;
  farmScoreTier: string;
  status: "ACTIVE" | "AT_RISK" | "DEFAULTING" | "COMPLETED" | "PENDING";
  loanAmount: number;
  primaryCrop: string;
  cooperative?: string;
}

interface StateStats {
  state: string;
  borrowerCount: number;
  totalDisbursed: number;
  repaymentRate: number;
  avgFarmScore: number;
  atRiskCount: number;
  defaultingCount: number;
}

interface ClusterPoint {
  lat: number;
  lng: number;
  count: number;
  avgFarmScore: number;
  statuses: Record<string, number>;
}

const NIGERIA_STATES_COORDS: Record<string, { lat: number; lng: number }> = {
  Abia: { lat: 5.4527, lng: 7.5248 },
  Adamawa: { lat: 9.3265, lng: 12.3984 },
  "Akwa Ibom": { lat: 5.0077, lng: 7.8493 },
  Anambra: { lat: 6.2209, lng: 6.9370 },
  Bauchi: { lat: 10.3158, lng: 9.8442 },
  Bayelsa: { lat: 4.7719, lng: 6.0699 },
  Benue: { lat: 7.3369, lng: 8.7400 },
  Borno: { lat: 11.8333, lng: 13.1500 },
  "Cross River": { lat: 5.9631, lng: 8.3300 },
  Delta: { lat: 5.8904, lng: 5.6800 },
  Ebonyi: { lat: 6.2649, lng: 8.0137 },
  Edo: { lat: 6.6342, lng: 5.9304 },
  Ekiti: { lat: 7.7190, lng: 5.3110 },
  Enugu: { lat: 6.4584, lng: 7.5464 },
  FCT: { lat: 9.0579, lng: 7.4951 },
  Gombe: { lat: 10.2897, lng: 11.1673 },
  Imo: { lat: 5.4921, lng: 7.0261 },
  Jigawa: { lat: 12.2280, lng: 9.5616 },
  Kaduna: { lat: 10.5222, lng: 7.4383 },
  Kano: { lat: 12.0022, lng: 8.5920 },
  Katsina: { lat: 13.0059, lng: 7.6000 },
  Kebbi: { lat: 12.4539, lng: 4.1975 },
  Kogi: { lat: 7.7337, lng: 6.6906 },
  Kwara: { lat: 8.9669, lng: 4.3874 },
  Lagos: { lat: 6.5244, lng: 3.3792 },
  Nasarawa: { lat: 8.5380, lng: 8.3222 },
  Niger: { lat: 9.9309, lng: 5.5983 },
  Ogun: { lat: 7.1607, lng: 3.3500 },
  Ondo: { lat: 7.2500, lng: 5.1931 },
  Osun: { lat: 7.5629, lng: 4.5200 },
  Oyo: { lat: 8.1574, lng: 3.6147 },
  Plateau: { lat: 9.2182, lng: 9.5175 },
  Rivers: { lat: 4.8156, lng: 7.0498 },
  Sokoto: { lat: 13.0533, lng: 5.2476 },
  Taraba: { lat: 7.8704, lng: 9.7800 },
  Yobe: { lat: 12.2939, lng: 11.4390 },
  Zamfara: { lat: 12.1704, lng: 6.2534 },
};

function getTierFromScore(score: number): string {
  if (score >= 800) return "EXCELLENT";
  if (score >= 650) return "GOOD";
  if (score >= 500) return "FAIR";
  if (score >= 300) return "POOR";
  return "BLACKLISTED";
}

function getBorrowerStatus(borrower: any): BorrowerLocation["status"] {
  if (!borrower.loans || borrower.loans.length === 0) return "PENDING";

  const activeLoans = borrower.loans.filter((l: any) => l.status === "ACTIVE");
  const completedLoans = borrower.loans.filter((l: any) => l.status === "COMPLETED");

  if (activeLoans.length === 0 && completedLoans.length > 0) return "COMPLETED";
  if (activeLoans.length === 0) return "PENDING";

  for (const loan of activeLoans) {
    const overdueRepayments = loan.repayments?.filter(
      (r: any) => r.status !== "PAID" && new Date(r.dueDate) < new Date()
    ) || [];

    if (overdueRepayments.length > 0) {
      const mostOverdue = overdueRepayments.reduce((max: any, r: any) => {
        const days = Math.floor((Date.now() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        return days > max ? days : max;
      }, 0);

      if (mostOverdue > 30) return "DEFAULTING";
      return "AT_RISK";
    }
  }

  return "ACTIVE";
}

export class MapService {
  static async getBorrowerLocations(
    lenderOrgId: string,
    filters: MapFilters = {}
  ): Promise<BorrowerLocation[]> {
    const where: any = {
      loans: { some: { program: { lenderOrgId } } },
    };

    if (filters.programId) {
      where.loans.some.programId = filters.programId;
    }

    if (filters.state) {
      where.state = filters.state;
    }

    if (filters.minFarmScore || filters.maxFarmScore) {
      where.farmScore = {};
      if (filters.minFarmScore) where.farmScore.gte = filters.minFarmScore;
      if (filters.maxFarmScore) where.farmScore.lte = filters.maxFarmScore;
    }

    if (filters.crop) {
      where.primaryCrop = filters.crop;
    }

    if (filters.cooperativeId) {
      where.cooperativeId = filters.cooperativeId;
    }

    const borrowers = await prisma.borrowerProfile.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true } },
        cooperative: { select: { name: true } },
        loans: {
          include: {
            repayments: {
              where: { dueDate: { lt: new Date() } },
              select: { status: true, dueDate: true },
            },
          },
        },
      },
    });

    return borrowers.map((b) => {
      const stateCoords = NIGERIA_STATES_COORDS[b.state] || { lat: 9.0820, lng: 8.6753 };
      const jitter = () => (Math.random() - 0.5) * 0.5;

      const totalLoanAmount = b.loans.reduce((sum, l) => sum + Number(l.amount), 0);
      const status = filters.status
        ? (filters.status as BorrowerLocation["status"])
        : getBorrowerStatus(b);

      return {
        id: b.id,
        farmerId: b.farmerId,
        name: `${b.user.firstName} ${b.user.lastName}`,
        lat: stateCoords.lat + jitter(),
        lng: stateCoords.lng + jitter(),
        state: b.state,
        lga: b.lga,
        farmScore: b.farmScore,
        farmScoreTier: getTierFromScore(b.farmScore),
        status,
        loanAmount: totalLoanAmount,
        primaryCrop: b.primaryCrop,
        cooperative: b.cooperative?.name,
      };
    }).filter((b) => {
      if (filters.status && b.status !== filters.status) return false;
      return true;
    });
  }

  static async getStateStats(lenderOrgId: string): Promise<StateStats[]> {
    const states = await prisma.borrowerProfile.groupBy({
      by: ["state"],
      where: { loans: { some: { program: { lenderOrgId } } } },
      _count: true,
      _avg: { farmScore: true },
    });

    const stateDetails = await Promise.all(
      states.map(async (s) => {
        const [loans, atRisk, defaulting] = await Promise.all([
          prisma.borrowerLoan.aggregate({
            where: { borrower: { state: s.state }, program: { lenderOrgId } },
            _sum: { amount: true, amountPaid: true },
          }),
          prisma.borrowerProfile.count({
            where: {
              state: s.state,
              loans: {
                some: {
                  program: { lenderOrgId },
                  status: "ACTIVE",
                  repayments: {
                    some: {
                      status: { in: ["PENDING", "PARTIAL"] },
                      dueDate: {
                        lt: new Date(),
                        gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      },
                    },
                  },
                },
              },
            },
          }),
          prisma.borrowerProfile.count({
            where: {
              state: s.state,
              loans: {
                some: {
                  program: { lenderOrgId },
                  status: "ACTIVE",
                  repayments: {
                    some: {
                      status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
                      dueDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                    },
                  },
                },
              },
            },
          }),
        ]);

        const disbursed = Number(loans._sum.amount || 0);
        const repaid = Number(loans._sum.amountPaid || 0);

        return {
          state: s.state,
          borrowerCount: s._count,
          totalDisbursed: disbursed,
          repaymentRate: disbursed > 0 ? Math.round((repaid / disbursed) * 100) : 0,
          avgFarmScore: Math.round(s._avg.farmScore || 0),
          atRiskCount: atRisk,
          defaultingCount: defaulting,
        };
      })
    );

    return stateDetails.sort((a, b) => b.borrowerCount - a.borrowerCount);
  }

  static async getHeatmapData(
    lenderOrgId: string,
    metric: "repayment" | "farmScore" | "density"
  ): Promise<Array<{ state: string; lat: number; lng: number; value: number }>> {
    const stateStats = await this.getStateStats(lenderOrgId);

    return stateStats.map((s) => {
      const coords = NIGERIA_STATES_COORDS[s.state] || { lat: 9.0820, lng: 8.6753 };
      let value: number;

      switch (metric) {
        case "repayment":
          value = s.repaymentRate;
          break;
        case "farmScore":
          value = s.avgFarmScore;
          break;
        case "density":
        default:
          value = s.borrowerCount;
          break;
      }

      return {
        state: s.state,
        lat: coords.lat,
        lng: coords.lng,
        value,
      };
    });
  }

  static async getMapSummary(lenderOrgId: string) {
    const [totalBorrowers, stateCount, statusCounts] = await Promise.all([
      prisma.borrowerProfile.count({
        where: { loans: { some: { program: { lenderOrgId } } } },
      }),
      prisma.borrowerProfile.groupBy({
        by: ["state"],
        where: { loans: { some: { program: { lenderOrgId } } } },
        _count: true,
      }),
      prisma.borrowerLoan.groupBy({
        by: ["status"],
        where: { program: { lenderOrgId } },
        _count: true,
      }),
    ]);

    return {
      totalBorrowers,
      statesWithBorrowers: stateCount.length,
      loanStatuses: statusCounts.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  static async getFieldAgentZones(lenderOrgId: string) {
    const agents = await prisma.fieldAgentProfile.findMany({
      where: { active: true },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    return agents.map((a) => {
      const stateCoords = NIGERIA_STATES_COORDS[a.state] || { lat: 9.0820, lng: 8.6753 };

      return {
        id: a.id,
        agentCode: a.agentCode,
        name: `${a.user.firstName} ${a.user.lastName}`,
        state: a.state,
        lat: stateCoords.lat,
        lng: stateCoords.lng,
        registrations: a.registrations,
        verifications: a.verifications,
        rating: a.rating,
      };
    });
  }

  static async getCrops(lenderOrgId: string): Promise<string[]> {
    const crops = await prisma.borrowerProfile.findMany({
      where: { loans: { some: { program: { lenderOrgId } } } },
      select: { primaryCrop: true },
      distinct: ["primaryCrop"],
    });

    return crops.map((c) => c.primaryCrop).filter(Boolean).sort();
  }
}
