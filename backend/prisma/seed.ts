import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Demo seeds must not be run in production");
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@agrotrack.ng" },
    update: {},
    create: {
      email: "admin@agrotrack.ng",
      phone: "08000000000",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
  });
  console.log("  ✅ Super Admin created");

  // Create Lender Organization
  const lenderOrg = await prisma.lenderOrganization.upsert({
    where: { id: "seed-lender-org" },
    update: {},
    create: {
      id: "seed-lender-org",
      name: "GreenField Microfinance",
      type: "Microfinance Bank",
      email: "info@greenfield.ng",
      phone: "08012345678",
      cacNumber: "RC-123456",
      plan: "GROWTH",
      status: "ACTIVE",
      verified: true,
      state: "Lagos",
    },
  });

  // Create Lender Admin
  const lenderAdmin = await prisma.user.upsert({
    where: { email: "lender@greenfield.ng" },
    update: {},
    create: {
      email: "lender@greenfield.ng",
      phone: "08012345679",
      passwordHash,
      firstName: "Chidi",
      lastName: "Okonkwo",
      role: "LENDER_ADMIN",
      lenderOrgId: lenderOrg.id,
      emailVerified: true,
    },
  });

  // Create Lender Manager
  await prisma.user.upsert({
    where: { email: "manager@greenfield.ng" },
    update: {},
    create: {
      email: "manager@greenfield.ng",
      phone: "08012345680",
      passwordHash,
      firstName: "Ngozi",
      lastName: "Eze",
      role: "LENDER_MANAGER",
      lenderOrgId: lenderOrg.id,
      emailVerified: true,
    },
  });

  // Create Lender Analyst
  await prisma.user.upsert({
    where: { email: "analyst@greenfield.ng" },
    update: {},
    create: {
      email: "analyst@greenfield.ng",
      phone: "08012345681",
      passwordHash,
      firstName: "Tunde",
      lastName: "Bakare",
      role: "LENDER_ANALYST",
      lenderOrgId: lenderOrg.id,
      emailVerified: true,
    },
  });
  console.log("  ✅ Lender organization & team created");

  // Create Loan Programs
  const programs = await Promise.all([
    prisma.program.upsert({
      where: { id: "seed-program-1" },
      update: {},
      create: {
        id: "seed-program-1",
        lenderOrgId: lenderOrg.id,
        name: "Cassava Value Chain",
        description: "Financing for cassava farmers covering planting through processing",
        type: "INPUT_CREDIT",
        interestRate: 12,
        maxAmount: 500000,
        minAmount: 50000,
        durationMonths: 12,
        requiredScore: 400,
        targetCrops: ["Cassava"],
        targetStates: ["Oyo", "Ogun", "Ondo"],
        disbursementType: "TRANCHE",
        trancheCount: 3,
        status: "ACTIVE",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
      },
    }),
    prisma.program.upsert({
      where: { id: "seed-program-2" },
      update: {},
      create: {
        id: "seed-program-2",
        lenderOrgId: lenderOrg.id,
        name: "Rice Paddy Expansion",
        description: "Loan for rice farmers seeking to expand operations with irrigation support",
        type: "CASH_LOAN",
        interestRate: 10,
        maxAmount: 1000000,
        minAmount: 100000,
        durationMonths: 18,
        requiredScore: 550,
        targetCrops: ["Rice"],
        targetStates: ["Kebbi", "Niger", "Ebonyi"],
        status: "ACTIVE",
        startDate: new Date("2026-01-01"),
      },
    }),
    prisma.program.upsert({
      where: { id: "seed-program-3" },
      update: {},
      create: {
        id: "seed-program-3",
        lenderOrgId: lenderOrg.id,
        name: "Maize Mechanization Fund",
        description: "Equipment finance for medium-scale maize farmers",
        type: "EQUIPMENT_LEASE",
        interestRate: 15,
        maxAmount: 2000000,
        minAmount: 200000,
        durationMonths: 24,
        requiredScore: 650,
        targetCrops: ["Maize"],
        targetStates: ["Kaduna", "Kano", "Plateau"],
        collateralRequired: true,
        insuranceRequired: true,
        status: "ACTIVE",
      },
    }),
  ]);
  console.log("  ✅ 3 loan programs created");

  // Create Cooperative
  const cooperative = await prisma.cooperative.upsert({
    where: { id: "seed-coop-1" },
    update: {},
    create: {
      id: "seed-coop-1",
      name: "Oyo Cassava Farmers Cooperative",
      regNumber: "COOP-OY-2024-001",
      state: "Oyo",
      lga: "Ibadan North",
      memberCount: 45,
      maxMembers: 100,
      status: "ACTIVE",
      lenderOrgId: lenderOrg.id,
      repaymentRate: 92.5,
    },
  });

  // Create Borrowers
  const borrowerData = [
    { first: "Adebayo", last: "Ogundimu", phone: "08031111111", email: "adebayo@mail.com", state: "Oyo", lga: "Ibadan South-West", crop: "Cassava", farm: 3.5, score: 720, farmerId: "FMR-1001" },
    { first: "Fatima", last: "Abubakar", phone: "08032222222", email: "fatima@mail.com", state: "Kebbi", lga: "Birnin Kebbi", crop: "Rice", farm: 5.0, score: 650, farmerId: "FMR-1002" },
    { first: "Emeka", last: "Nwosu", phone: "08033333333", email: "emeka@mail.com", state: "Ebonyi", lga: "Abakaliki", crop: "Rice", farm: 2.0, score: 480, farmerId: "FMR-1003" },
    { first: "Amina", last: "Yusuf", phone: "08034444444", email: "amina@mail.com", state: "Kaduna", lga: "Zaria", crop: "Maize", farm: 4.0, score: 580, farmerId: "FMR-1004" },
    { first: "Oluwaseun", last: "Akintola", phone: "08035555555", email: "seun@mail.com", state: "Ogun", lga: "Abeokuta South", crop: "Cassava", farm: 6.0, score: 790, farmerId: "FMR-1005" },
  ];

  const borrowers = await Promise.all(
    borrowerData.map(async (b) => {
      const user = await prisma.user.upsert({
        where: { email: b.email },
        update: {},
        create: {
          email: b.email,
          phone: b.phone,
          passwordHash,
          firstName: b.first,
          lastName: b.last,
          role: "BORROWER",
          emailVerified: true,
        },
      });

      const profile = await prisma.borrowerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          farmerId: b.farmerId,
          state: b.state,
          lga: b.lga,
          farmSizeHa: b.farm,
          primaryCrop: b.crop,
          secondaryCrops: b.crop === "Cassava" ? ["Maize", "Yam"] : [],
          farmScore: b.score,
          farmScoreTier: b.score >= 750 ? "EXCELLENT" : b.score >= 650 ? "GOOD" : b.score >= 500 ? "FAIR" : "POOR",
          cooperativeId: b.crop === "Cassava" ? cooperative.id : undefined,
          yearsExperience: Math.floor(3 + Math.random() * 10),
          gender: ["Adebayo", "Emeka", "Oluwaseun"].includes(b.first) ? "M" : "F",
          language: b.state === "Kebbi" || b.state === "Kaduna" ? "ha" : "en",
        },
      });

      return { user, profile };
    })
  );
  console.log("  ✅ 5 borrowers created");

  // Create Field Agent
  const fieldAgentUser = await prisma.user.upsert({
    where: { email: "agent@agrotrack.ng" },
    update: {},
    create: {
      email: "agent@agrotrack.ng",
      phone: "08041111111",
      passwordHash,
      firstName: "Ibrahim",
      lastName: "Musa",
      role: "FIELD_AGENT",
      emailVerified: true,
    },
  });

  await prisma.fieldAgentProfile.upsert({
    where: { userId: fieldAgentUser.id },
    update: {},
    create: {
      userId: fieldAgentUser.id,
      agentCode: "AGT-OY-001",
      state: "Oyo",
      lga: "Ibadan North",
      coverageArea: ["Ibadan North", "Ibadan South-West", "Ibadan South-East"],
      registrations: 23,
      verifications: 18,
      inspections: 45,
      rating: 4.5,
      totalRatings: 30,
      commissionRate: 2.5,
    },
  });
  console.log("  ✅ Field agent created");

  // Create Applications
  const app1 = await prisma.application.upsert({
    where: { id: "seed-app-1" },
    update: {},
    create: {
      id: "seed-app-1",
      borrowerId: borrowers[0].profile.id,
      programId: programs[0].id,
      amount: 300000,
      purpose: "Purchase of improved cassava stems and fertilizer for the planting season",
      status: "APPROVED",
      farmScoreAtApply: 720,
      submittedAt: new Date("2026-01-10"),
      reviewedBy: lenderAdmin.id,
      reviewedAt: new Date("2026-01-14"),
    },
  });

  const app2 = await prisma.application.upsert({
    where: { id: "seed-app-2" },
    update: {},
    create: {
      id: "seed-app-2",
      borrowerId: borrowers[1].profile.id,
      programId: programs[1].id,
      amount: 750000,
      purpose: "Expand rice paddies and install drip irrigation system",
      status: "APPROVED",
      farmScoreAtApply: 650,
      submittedAt: new Date("2026-01-20"),
      reviewedBy: lenderAdmin.id,
      reviewedAt: new Date("2026-01-28"),
    },
  });

  await prisma.application.upsert({
    where: { id: "seed-app-3" },
    update: {},
    create: {
      id: "seed-app-3",
      borrowerId: borrowers[2].profile.id,
      programId: programs[1].id,
      amount: 400000,
      purpose: "Rice farming expansion in Abakaliki",
      status: "UNDER_REVIEW",
      farmScoreAtApply: 480,
      submittedAt: new Date("2026-03-01"),
    },
  });
  console.log("  ✅ 3 applications created");

  // Create Loans
  const loan1 = await prisma.borrowerLoan.upsert({
    where: { id: "seed-loan-1" },
    update: {},
    create: {
      id: "seed-loan-1",
      borrowerId: borrowers[0].profile.id,
      programId: programs[0].id,
      applicationId: app1.id,
      amount: 300000,
      interestRate: 12,
      totalRepayable: 336000,
      amountPaid: 112000,
      status: "ACTIVE",
      trancheCount: 3,
      currentTranche: 2,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2027-01-15"),
      nextPaymentDate: new Date("2026-06-15"),
    },
  });

  const loan2 = await prisma.borrowerLoan.upsert({
    where: { id: "seed-loan-2" },
    update: {},
    create: {
      id: "seed-loan-2",
      borrowerId: borrowers[1].profile.id,
      programId: programs[1].id,
      applicationId: app2.id,
      amount: 750000,
      interestRate: 10,
      totalRepayable: 825000,
      amountPaid: 91667,
      status: "ACTIVE",
      trancheCount: 1,
      currentTranche: 1,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2027-08-01"),
      nextPaymentDate: new Date("2026-07-01"),
    },
  });
  console.log("  ✅ 2 active loans created");

  // Create Disbursements (tranche-based for loan1)
  await Promise.all([
    prisma.disbursement.upsert({
      where: { id: "seed-disb-1" },
      update: {},
      create: {
        id: "seed-disb-1",
        loanId: loan1.id,
        trancheNumber: 1,
        amount: 100000,
        status: "COMPLETED",
        approvedBy: lenderAdmin.id,
        approvedAt: new Date("2026-01-15"),
        paymentRef: "PAY-REF-001",
        processedAt: new Date("2026-01-16"),
      },
    }),
    prisma.disbursement.upsert({
      where: { id: "seed-disb-2" },
      update: {},
      create: {
        id: "seed-disb-2",
        loanId: loan1.id,
        trancheNumber: 2,
        amount: 100000,
        status: "COMPLETED",
        approvedBy: lenderAdmin.id,
        approvedAt: new Date("2026-03-15"),
        paymentRef: "PAY-REF-002",
        processedAt: new Date("2026-03-16"),
      },
    }),
    prisma.disbursement.upsert({
      where: { id: "seed-disb-3" },
      update: {},
      create: {
        id: "seed-disb-3",
        loanId: loan1.id,
        trancheNumber: 3,
        amount: 100000,
        status: "PENDING",
      },
    }),
    prisma.disbursement.upsert({
      where: { id: "seed-disb-4" },
      update: {},
      create: {
        id: "seed-disb-4",
        loanId: loan2.id,
        trancheNumber: 1,
        amount: 750000,
        status: "COMPLETED",
        approvedBy: lenderAdmin.id,
        approvedAt: new Date("2026-02-01"),
        paymentRef: "PAY-REF-003",
        processedAt: new Date("2026-02-02"),
      },
    }),
  ]);

  // Create Repayments
  for (let i = 1; i <= 6; i++) {
    const dueDate = new Date("2026-01-15");
    dueDate.setMonth(dueDate.getMonth() + i);

    await prisma.repayment.upsert({
      where: { id: `seed-repay-${i}` },
      update: {},
      create: {
        id: `seed-repay-${i}`,
        loanId: loan1.id,
        amount: 28000,
        dueDate,
        status: i <= 4 ? "PAID" : "PENDING",
        paidAmount: i <= 4 ? 28000 : null,
        paidAt: i <= 4 ? new Date(dueDate.getTime() - 86400000 * 2) : null,
        paymentMethod: i <= 4 ? "BANK_TRANSFER" : null,
        paymentRef: i <= 4 ? `RPY-REF-${String(i).padStart(3, "0")}` : null,
      },
    });
  }
  console.log("  ✅ Disbursements & repayments seeded");

  // Create Farm Reports
  await Promise.all([
    prisma.farmReport.create({
      data: {
        borrowerId: borrowers[0].profile.id,
        type: "GROWTH_UPDATE",
        title: "Cassava stem sprouting well",
        description: "All stems showing healthy growth after 3 weeks. Applied first round of fertilizer.",
        cropStage: "VEGETATIVE",
        healthRating: 4,
        status: "VERIFIED",
        verifiedBy: fieldAgentUser.id,
        verifiedAt: new Date("2026-02-20"),
      },
    }),
    prisma.farmReport.create({
      data: {
        borrowerId: borrowers[0].profile.id,
        type: "HARVEST",
        title: "Early harvest from first plot",
        description: "Harvested 2 tonnes from the 1-hectare trial plot. Good tuber size.",
        cropStage: "HARVEST",
        healthRating: 5,
        status: "VERIFIED",
        verifiedBy: fieldAgentUser.id,
        verifiedAt: new Date("2026-05-10"),
      },
    }),
    prisma.farmReport.create({
      data: {
        borrowerId: borrowers[1].profile.id,
        type: "GROWTH_UPDATE",
        title: "Rice paddies flowering",
        description: "Rice plants have entered flowering stage. No pest issues detected.",
        cropStage: "FLOWERING",
        healthRating: 4,
        status: "PENDING",
      },
    }),
  ]);
  console.log("  ✅ Farm reports created");

  // Create FarmScore History
  await Promise.all([
    prisma.farmScoreHistory.create({
      data: {
        borrowerId: borrowers[0].profile.id,
        score: 720,
        previousScore: 680,
        tier: "GOOD",
        components: {
          repaymentHistory: 180,
          farmProductivity: 150,
          experience: 120,
          collateral: 100,
          cooperativeMembership: 90,
          weatherResilience: 80,
        },
        changeReason: "Consistent repayments and good harvest report",
      },
    }),
    prisma.farmScoreHistory.create({
      data: {
        borrowerId: borrowers[4].profile.id,
        score: 790,
        previousScore: 750,
        tier: "EXCELLENT",
        components: {
          repaymentHistory: 200,
          farmProductivity: 170,
          experience: 140,
          collateral: 110,
          cooperativeMembership: 90,
          weatherResilience: 80,
        },
        changeReason: "Perfect repayment history across 2 loan cycles",
      },
    }),
  ]);
  console.log("  ✅ FarmScore history created");

  // Create Transactions
  await Promise.all([
    prisma.transaction.create({
      data: {
        reference: "TXN-2026-001",
        type: "DISBURSEMENT",
        status: "SUCCESS",
        amount: 100000,
        provider: "PAYSTACK",
        providerRef: "PSK_ref_001",
        loanId: loan1.id,
        borrowerId: borrowers[0].profile.id,
        processedAt: new Date("2026-01-16"),
      },
    }),
    prisma.transaction.create({
      data: {
        reference: "TXN-2026-002",
        type: "REPAYMENT",
        status: "SUCCESS",
        amount: 28000,
        provider: "PAYSTACK",
        providerRef: "PSK_ref_002",
        loanId: loan1.id,
        borrowerId: borrowers[0].profile.id,
        processedAt: new Date("2026-02-13"),
      },
    }),
  ]);
  console.log("  ✅ Transactions created");

  // Create Field Visit
  await prisma.fieldVisit.create({
    data: {
      agentId: (await prisma.fieldAgentProfile.findUnique({ where: { userId: fieldAgentUser.id } }))!.id,
      borrowerId: borrowers[0].profile.id,
      purpose: "Pre-disbursement farm verification",
      notes: "Farm in good condition. Cassava stems ready for planting. Land properly cleared.",
      latitude: 7.3775,
      longitude: 3.9470,
      status: "COMPLETED",
      scheduledAt: new Date("2026-01-12"),
      completedAt: new Date("2026-01-12"),
      rating: 5,
    },
  });
  console.log("  ✅ Field visit created");

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: borrowers[0].user.id,
        title: "Loan Disbursed",
        body: "Your first tranche of ₦100,000 has been disbursed to your account.",
        type: "DISBURSEMENT",
        channel: "IN_APP",
        read: true,
        readAt: new Date("2026-01-16"),
        data: { loanId: loan1.id, amount: 100000 },
      },
    }),
    prisma.notification.create({
      data: {
        userId: borrowers[0].user.id,
        title: "Payment Due Soon",
        body: "Your repayment of ₦28,000 is due on June 15th.",
        type: "PAYMENT_DUE",
        channel: "IN_APP",
        read: false,
        data: { loanId: loan1.id, amount: 28000, dueDate: "2026-06-15" },
      },
    }),
  ]);
  console.log("  ✅ Notifications created");

  // Create Feature Flags
  await Promise.all([
    prisma.featureFlag.upsert({ where: { key: "sms_notifications" }, update: {}, create: { key: "sms_notifications", description: "Enable SMS notifications for borrowers", enabled: true } }),
    prisma.featureFlag.upsert({ where: { key: "ai_scoring" }, update: {}, create: { key: "ai_scoring", description: "Use AI model for FarmScore calculation", enabled: false } }),
    prisma.featureFlag.upsert({ where: { key: "mobile_money" }, update: {}, create: { key: "mobile_money", description: "Enable mobile money repayments", enabled: true } }),
    prisma.featureFlag.upsert({ where: { key: "cooperative_loans" }, update: {}, create: { key: "cooperative_loans", description: "Allow cooperative-level loan applications", enabled: false } }),
    prisma.featureFlag.upsert({ where: { key: "whatsapp_bot" }, update: {}, create: { key: "whatsapp_bot", description: "Enable WhatsApp bot for borrower interactions", enabled: false } }),
    prisma.featureFlag.upsert({ where: { key: "ussd_access" }, update: {}, create: { key: "ussd_access", description: "Enable USSD access for feature phone users", enabled: true } }),
    prisma.featureFlag.upsert({ where: { key: "weather_alerts" }, update: {}, create: { key: "weather_alerts", description: "Push weather alerts to farmers in affected regions", enabled: true } }),
  ]);
  console.log("  ✅ Feature flags created");

  // Create System Config
  await Promise.all([
    prisma.systemConfig.upsert({
      where: { key: "farm_score_weights" },
      update: {},
      create: {
        key: "farm_score_weights",
        value: {
          repaymentHistory: 0.30,
          farmProductivity: 0.25,
          experience: 0.15,
          collateral: 0.12,
          cooperativeMembership: 0.10,
          weatherResilience: 0.08,
        },
        category: "scoring",
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: "platform_settings" },
      update: {},
      create: {
        key: "platform_settings",
        value: {
          maxLoginAttempts: 5,
          lockoutDurationMinutes: 30,
          otpExpiryMinutes: 10,
          defaultLanguage: "en",
          supportedLanguages: ["en", "ha", "yo", "ig"],
          currency: "NGN",
        },
        category: "platform",
      },
    }),
  ]);
  console.log("  ✅ System config created");

  // Create Weather Alert
  await prisma.weatherAlert.create({
    data: {
      state: "Oyo",
      alertType: "HEAVY_RAIN",
      severity: "WARNING",
      title: "Heavy Rainfall Expected",
      description: "Heavy rainfall expected across Oyo state for the next 48 hours. Farmers should secure harvested crops and ensure proper drainage.",
      startsAt: new Date("2026-06-20"),
      endsAt: new Date("2026-06-22"),
      source: "NiMet",
      active: true,
    },
  });
  console.log("  ✅ Weather alert created");

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Test accounts:");
  console.log("   Admin:       admin@agrotrack.ng / password123");
  console.log("   Lender:      lender@greenfield.ng / password123");
  console.log("   Manager:     manager@greenfield.ng / password123");
  console.log("   Analyst:     analyst@greenfield.ng / password123");
  console.log("   Field Agent: agent@agrotrack.ng / password123");
  console.log("   Borrower:    adebayo@mail.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
