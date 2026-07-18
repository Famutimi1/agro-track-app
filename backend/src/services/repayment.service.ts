import { Prisma, RepaymentMethod, RepaymentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";
import { logger } from "../config/logger";
import { env } from "../config/env";
import { PaystackService } from "./paystack.service";
import { NotificationService, NotificationTemplates } from "./notification.service";
import { emitToUser } from "../config/socket";

interface RepaymentQuery extends PaginationQuery {
  status?: string;
  programId?: string;
  state?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
  daysLateMin?: number;
  daysLateMax?: number;
}

export class RepaymentService {
  static async getAll(lenderOrgId: string, query: RepaymentQuery) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.RepaymentWhereInput = { loan: { program: { lenderOrgId } } };

    if (query.status) where.status = query.status as RepaymentStatus;
    if (query.programId) where.loan = { ...where.loan as any, programId: query.programId };
    if (query.state) where.loan = { ...where.loan as any, borrower: { state: query.state } };
    if (query.method) where.paymentMethod = query.method as RepaymentMethod;
    if (query.dateFrom || query.dateTo) {
      where.dueDate = {};
      if (query.dateFrom) where.dueDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.dueDate.lte = new Date(query.dateTo);
    }

    const [repayments, total] = await Promise.all([
      prisma.repayment.findMany({
        where, skip, take: limit, orderBy: { dueDate: "asc" },
        include: {
          loan: {
            include: {
              borrower: {
                include: { user: { select: { firstName: true, lastName: true } } },
              },
              program: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.repayment.count({ where }),
    ]);

    const now = new Date();
    const formatted = repayments.map((r) => {
      const dueDate = new Date(r.dueDate);
      const paidDate = r.paidAt ? new Date(r.paidAt) : null;
      let daysLate = 0;

      if (r.status === "PAID" && paidDate) {
        daysLate = Math.max(0, Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      } else if (r.status !== "PAID" && r.status !== "WAIVED") {
        daysLate = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      }

      return {
        ...r,
        amount: Number(r.amount),
        paidAmount: r.paidAmount ? Number(r.paidAmount) : null,
        penaltyAmount: r.penaltyAmount ? Number(r.penaltyAmount) : null,
        daysLate,
      };
    });

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getOverdue(lenderOrgId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);
    const now = new Date();

    const where: Prisma.RepaymentWhereInput = {
      loan: { program: { lenderOrgId } },
      status: { in: ["PENDING", "LATE"] },
      dueDate: { lt: now },
    };

    const [repayments, total] = await Promise.all([
      prisma.repayment.findMany({
        where, skip, take: limit,
        orderBy: { dueDate: "asc" },
        include: {
          loan: {
            include: {
              borrower: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
              program: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.repayment.count({ where }),
    ]);

    const formatted = repayments.map((r) => ({
      ...r,
      amount: Number(r.amount),
      daysLate: Math.floor((now.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getScheduled(lenderOrgId: string, query: PaginationQuery & { days?: number }) {
    const { page, limit, skip } = getPagination(query);
    const now = new Date();
    const daysAhead = query.days || 30;
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const where: Prisma.RepaymentWhereInput = {
      loan: { program: { lenderOrgId } },
      status: "PENDING",
      dueDate: { gte: now, lte: futureDate },
    };

    const [repayments, total] = await Promise.all([
      prisma.repayment.findMany({
        where, skip, take: limit,
        orderBy: { dueDate: "asc" },
        include: {
          loan: {
            include: {
              borrower: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
              program: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.repayment.count({ where }),
    ]);

    const formatted = repayments.map((r) => ({
      ...r,
      amount: Number(r.amount),
      daysUntilDue: Math.ceil((new Date(r.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getById(id: string, lenderOrgId: string) {
    const repayment = await prisma.repayment.findFirst({
      where: { id, loan: { program: { lenderOrgId } } },
      include: {
        loan: {
          include: {
            borrower: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } } },
            program: { select: { id: true, name: true, interestRate: true } },
          },
        },
      },
    });

    if (!repayment) throw ApiError.notFound("Repayment not found");

    return {
      ...repayment,
      amount: Number(repayment.amount),
      paidAmount: repayment.paidAmount ? Number(repayment.paidAmount) : null,
      penaltyAmount: repayment.penaltyAmount ? Number(repayment.penaltyAmount) : null,
    };
  }

  static async getStats(lenderOrgId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere = { loan: { program: { lenderOrgId } } };

    const [
      collectedThisMonth,
      totalScheduled,
      onTimeCount,
      lateCount,
      overdueBalance,
      methodBreakdown,
      monthlyTrend,
    ] = await Promise.all([
      prisma.repayment.aggregate({
        where: { ...baseWhere, status: "PAID", paidAt: { gte: startOfMonth } },
        _sum: { paidAmount: true },
        _count: true,
      }),
      prisma.repayment.count({
        where: { ...baseWhere, dueDate: { gte: startOfMonth, lte: now } },
      }),
      prisma.repayment.count({
        where: {
          ...baseWhere,
          status: "PAID",
          paidAt: { gte: startOfMonth },
        },
      }),
      prisma.repayment.count({
        where: {
          ...baseWhere,
          status: { in: ["PENDING", "LATE"] },
          dueDate: { lt: now },
        },
      }),
      prisma.repayment.aggregate({
        where: {
          ...baseWhere,
          status: { in: ["PENDING", "LATE"] },
          dueDate: { lt: now },
        },
        _sum: { amount: true },
      }),
      prisma.repayment.groupBy({
        by: ["paymentMethod"],
        where: { ...baseWhere, status: "PAID", paymentMethod: { not: null } },
        _count: true,
      }),
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
          return Promise.all([
            prisma.repayment.count({
              where: { ...baseWhere, status: "PAID", paidAt: { gte: date, lte: endDate } },
            }),
            prisma.repayment.count({
              where: {
                ...baseWhere,
                status: "PAID",
                paidAt: { gte: date, lte: endDate },
                dueDate: { gte: date },
              },
            }),
            prisma.repayment.count({
              where: {
                ...baseWhere,
                status: { in: ["LATE", "DEFAULTED"] },
                dueDate: { gte: date, lte: endDate },
              },
            }),
          ]).then(([total, onTime, late]) => ({
            month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
            onTime,
            late: total - onTime,
            defaulted: late,
          }));
        })
      ),
    ]);

    const onTimeRate = totalScheduled > 0 ? Math.round((onTimeCount / totalScheduled) * 100) : 0;

    const totalMethodCount = methodBreakdown.reduce((s, m) => s + m._count, 0);
    const methods = methodBreakdown.map((m) => ({
      method: m.paymentMethod || "UNKNOWN",
      count: m._count,
      percentage: totalMethodCount > 0 ? Math.round((m._count / totalMethodCount) * 100) : 0,
    }));

    return {
      collectedThisMonth: {
        amount: Number(collectedThisMonth._sum.paidAmount || 0),
        count: collectedThisMonth._count,
      },
      onTimeRate,
      overdueBalance: Number(overdueBalance._sum.amount || 0),
      overdueCount: lateCount,
      methodBreakdown: methods,
      monthlyTrend: monthlyTrend.reverse(),
    };
  }

  static async recordPayment(
    id: string,
    data: {
      amount: number;
      method: RepaymentMethod;
      reference?: string;
      paidAt?: Date;
      receiptUrl?: string;
    },
    recordedBy: string
  ) {
    return this.finalizePayment(id, data, recordedBy);
  }

  private static async finalizePayment(
    id: string,
    data: {
      amount: number;
      method: RepaymentMethod;
      reference?: string;
      paidAt?: Date;
      receiptUrl?: string;
    },
    recordedBy: string
  ) {
    const repayment = await prisma.repayment.findUnique({
      where: { id },
      include: { loan: { include: { borrower: true } } },
    });

    if (!repayment) throw ApiError.notFound("Repayment not found");
    if (repayment.status === "PAID") throw ApiError.badRequest("Repayment already paid");

    const dueDate = new Date(repayment.dueDate);
    const paidAt = data.paidAt || new Date();
    const daysLate = Math.max(0, Math.floor((paidAt.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.repayment.update({
        where: { id },
        data: {
          status: "PAID",
          paidAmount: data.amount,
          paidAt,
          paymentMethod: data.method,
          paymentRef: data.reference,
        },
      });

      await tx.borrowerLoan.update({
        where: { id: repayment.loanId },
        data: { amountPaid: { increment: data.amount } },
      });

      if (data.reference) {
        await tx.transaction.create({
          data: {
            reference: data.reference,
            type: "REPAYMENT",
            status: "SUCCESS",
            amount: data.amount,
            loanId: repayment.loanId,
            processedAt: paidAt,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: recordedBy,
          action: "REPAYMENT_RECORDED",
          resource: "REPAYMENT",
          resourceId: id,
          details: {
            amount: data.amount,
            method: data.method,
            reference: data.reference,
            daysLate,
          },
        },
      });

      return updated;
    });

    logger.info("Repayment recorded", { id, amount: data.amount, method: data.method });

    const borrowerUserId = repayment.loan.borrower.userId;
    NotificationService.send({
      userId: borrowerUserId,
      ...NotificationTemplates.paymentReceived(data.amount),
    }).catch((err) => logger.error("Failed to send payment-received notification", { id, err }));
    emitToUser(borrowerUserId, "repayment:updated", { ...result, amount: Number(result.amount) });

    return { ...result, amount: Number(result.amount), paidAmount: Number(result.paidAmount) };
  }

  static async waive(
    id: string,
    data: { reason: string; waivedAmount?: number },
    approvedBy: string
  ) {
    const repayment = await prisma.repayment.findUnique({ where: { id } });
    if (!repayment) throw ApiError.notFound("Repayment not found");
    if (repayment.status === "PAID") throw ApiError.badRequest("Cannot waive a paid repayment");

    const waivedAmount = data.waivedAmount || Number(repayment.amount);

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.repayment.update({
        where: { id },
        data: {
          status: "WAIVED",
          paidAmount: waivedAmount,
          paidAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: approvedBy,
          action: "REPAYMENT_WAIVED",
          resource: "REPAYMENT",
          resourceId: id,
          details: {
            reason: data.reason,
            waivedAmount,
            originalAmount: Number(repayment.amount),
          },
        },
      });

      return updated;
    });

    logger.info("Repayment waived", { id, reason: data.reason, waivedAmount });

    return { ...result, amount: Number(result.amount), paidAmount: Number(result.paidAmount) };
  }

  static async markDefaulted(id: string, reviewerId: string) {
    const repayment = await prisma.repayment.findUnique({
      where: { id },
      include: { loan: { include: { borrower: true } } },
    });

    if (!repayment) throw ApiError.notFound("Repayment not found");
    if (repayment.status === "PAID" || repayment.status === "WAIVED") {
      throw ApiError.badRequest("Cannot mark paid or waived repayment as defaulted");
    }

    const now = new Date();
    const daysLate = Math.floor((now.getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 60 * 60 * 24));

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.repayment.update({
        where: { id },
        data: { status: "DEFAULTED" },
      });

      await tx.borrowerLoan.update({
        where: { id: repayment.loanId },
        data: { status: "DEFAULTED" },
      });

      const currentScore = repayment.loan.borrower.farmScore || 0;
      const penalty = Math.min(50, daysLate * 2);
      const newScore = Math.max(0, currentScore - penalty);

      await tx.farmScoreHistory.create({
        data: {
          borrowerId: repayment.loan.borrower.id,
          score: newScore,
          previousScore: currentScore,
          tier: newScore >= 700 ? "GOOD" : newScore >= 500 ? "FAIR" : "POOR",
          components: { defaultPenalty: -penalty },
        },
      });

      await tx.borrowerProfile.update({
        where: { id: repayment.loan.borrower.id },
        data: {
          farmScore: newScore,
          farmScoreTier: newScore >= 700 ? "GOOD" : newScore >= 500 ? "FAIR" : "POOR",
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "REPAYMENT_DEFAULTED",
          resource: "REPAYMENT",
          resourceId: id,
          details: { daysLate, scorePenalty: penalty },
        },
      });

      return updated;
    });

    logger.info("Repayment marked as defaulted", { id, daysLate });

    return { ...result, amount: Number(result.amount) };
  }

  static async reverse(id: string, reason: string, reviewerId: string) {
    const repayment = await prisma.repayment.findUnique({ where: { id } });
    if (!repayment) throw ApiError.notFound("Repayment not found");
    if (repayment.status !== "PAID") throw ApiError.badRequest("Can only reverse paid repayments");

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.repayment.update({
        where: { id },
        data: {
          status: "PENDING",
          paidAmount: null,
          paidAt: null,
          paymentMethod: null,
          paymentRef: null,
        },
      });

      if (repayment.paidAmount) {
        await tx.borrowerLoan.update({
          where: { id: repayment.loanId },
          data: { amountPaid: { decrement: Number(repayment.paidAmount) } },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "REPAYMENT_REVERSED",
          resource: "REPAYMENT",
          resourceId: id,
          details: {
            reason,
            reversedAmount: Number(repayment.paidAmount),
            originalPaymentRef: repayment.paymentRef,
          },
        },
      });

      return updated;
    });

    logger.info("Repayment reversed", { id, reason });

    return { ...result, amount: Number(result.amount) };
  }

  static async sendReminders(
    borrowerIds: string[],
    message: string | undefined,
    channels: string[],
    sentBy: string
  ) {
    const repayments = await prisma.repayment.findMany({
      where: {
        loan: { borrowerId: { in: borrowerIds } },
        status: { in: ["PENDING", "LATE"] },
      },
      include: {
        loan: {
          include: {
            borrower: { include: { user: { select: { firstName: true, phone: true } } } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
      distinct: ["loanId"],
    });

    const sent: string[] = [];
    for (const r of repayments) {
      const phone = r.loan.borrower.user.phone;
      if (!phone) continue;

      const defaultMessage = `Dear ${r.loan.borrower.user.firstName}, your loan repayment of ₦${Number(r.amount).toLocaleString()} is due on ${new Date(r.dueDate).toLocaleDateString()}. Please make payment to avoid penalties.`;

      logger.info("Reminder sent", {
        borrowerId: r.loan.borrowerId,
        phone,
        channels,
        message: message || defaultMessage,
      });

      sent.push(r.loan.borrowerId);
    }

    await prisma.auditLog.create({
      data: {
        userId: sentBy,
        action: "REMINDERS_SENT",
        resource: "REPAYMENT",
        resourceId: "bulk",
        details: { borrowerIds: sent, channels, customMessage: !!message },
      },
    });

    return { sent: sent.length, total: borrowerIds.length };
  }

  static async getBorrowerRepayments(userId: string) {
    const repayments = await prisma.repayment.findMany({
      where: { loan: { borrower: { userId } } },
      include: { loan: { include: { program: { select: { name: true } } } } },
      orderBy: { dueDate: "asc" },
    });

    return repayments.map((r) => ({
      ...r,
      amount: Number(r.amount),
      paidAmount: r.paidAmount ? Number(r.paidAmount) : null,
    }));
  }

  private static async getOwnedRepayment(repaymentId: string, userId: string) {
    const repayment = await prisma.repayment.findFirst({
      where: { id: repaymentId, loan: { borrower: { userId } } },
      include: { loan: { include: { borrower: { include: { user: true } } } } },
    });

    if (!repayment) throw ApiError.notFound("Repayment not found");
    return repayment;
  }

  static async initiateCardPayment(repaymentId: string, userId: string) {
    const repayment = await this.getOwnedRepayment(repaymentId, userId);
    if (repayment.status === "PAID") throw ApiError.badRequest("Repayment already paid");

    const reference = PaystackService.generateReference("RPY");
    const { authorization_url } = await PaystackService.initializeTransaction({
      email: repayment.loan.borrower.user.email,
      amount: Number(repayment.amount),
      reference,
    });

    await prisma.repayment.update({
      where: { id: repaymentId },
      data: { metadata: { channel: "CARD", reference } },
    });

    return { authorizationUrl: authorization_url, reference };
  }

  static async verifyCardPayment(repaymentId: string, userId: string, reference: string) {
    await this.getOwnedRepayment(repaymentId, userId);

    const verification = await PaystackService.verifyTransaction(reference);
    if (verification.status !== "success") {
      throw ApiError.badRequest("Payment was not successful");
    }

    return this.finalizePayment(
      repaymentId,
      { amount: verification.amount / 100, method: "CARD", reference },
      userId
    );
  }

  static async verifyCardPaymentByReference(userId: string, reference: string) {
    const repayment = await prisma.repayment.findFirst({
      where: {
        metadata: { path: ["reference"], equals: reference },
        loan: { borrower: { userId } },
      },
    });

    if (!repayment) throw ApiError.notFound("Repayment not found for this reference");
    if (repayment.status === "PAID") {
      return { ...repayment, amount: Number(repayment.amount), paidAmount: repayment.paidAmount ? Number(repayment.paidAmount) : null };
    }

    return this.verifyCardPayment(repayment.id, userId, reference);
  }

  static async handlePaystackWebhook(rawBody: string, signature: string) {
    if (!PaystackService.verifyWebhookSignature(rawBody, signature)) {
      throw ApiError.unauthorized("Invalid webhook signature");
    }

    const payload = JSON.parse(rawBody);
    if (payload.event !== "charge.success") return;

    const reference = payload.data.reference;
    const repayment = await prisma.repayment.findFirst({
      where: { metadata: { path: ["reference"], equals: reference } },
      include: { loan: { include: { borrower: true } } },
    });

    if (!repayment || repayment.status === "PAID") return;

    await this.finalizePayment(
      repayment.id,
      { amount: payload.data.amount / 100, method: "CARD", reference },
      repayment.loan.borrower.userId
    );
  }

  static async initiateBankTransfer(repaymentId: string, userId: string) {
    const repayment = await this.getOwnedRepayment(repaymentId, userId);
    if (repayment.status === "PAID") throw ApiError.badRequest("Repayment already paid");

    const reference = PaystackService.generateReference("BNK");
    await prisma.repayment.update({
      where: { id: repaymentId },
      data: { metadata: { channel: "BANK_TRANSFER", reference } },
    });

    return {
      reference,
      bankName: env.PLATFORM_BANK_NAME,
      accountNumber: env.PLATFORM_BANK_ACCOUNT,
      accountName: env.PLATFORM_BANK_ACCOUNT_NAME,
      amount: Number(repayment.amount),
    };
  }

  static async initiateUssd(repaymentId: string, userId: string) {
    const repayment = await this.getOwnedRepayment(repaymentId, userId);
    if (repayment.status === "PAID") throw ApiError.badRequest("Repayment already paid");

    const reference = PaystackService.generateReference("USD");
    await prisma.repayment.update({
      where: { id: repaymentId },
      data: { metadata: { channel: "USSD", reference } },
    });

    return {
      reference,
      ussdCode: `*966*${Math.round(Number(repayment.amount))}#`,
    };
  }

  static async confirmManualPayment(repaymentId: string, userId: string, method: "BANK_TRANSFER" | "USSD") {
    const repayment = await this.getOwnedRepayment(repaymentId, userId);
    if (repayment.status === "PAID") throw ApiError.badRequest("Repayment already paid");

    const existingMetadata = (repayment.metadata as Record<string, any>) || {};
    const updated = await prisma.repayment.update({
      where: { id: repaymentId },
      data: {
        status: "PENDING_VERIFICATION",
        paymentMethod: method,
        metadata: { ...existingMetadata, channel: method, reportedAt: new Date().toISOString() },
      },
    });

    logger.info("Repayment manual confirmation reported", { repaymentId, method });

    return { ...updated, amount: Number(updated.amount) };
  }

  static async declareInKind(
    repaymentId: string,
    userId: string,
    data: { produceType: string; quantityKg: number; deliveryLocation: string }
  ) {
    const repayment = await this.getOwnedRepayment(repaymentId, userId);
    if (repayment.status === "PAID") throw ApiError.badRequest("Repayment already paid");

    const updated = await prisma.repayment.update({
      where: { id: repaymentId },
      data: {
        status: "PENDING_VERIFICATION",
        paymentMethod: "IN_KIND",
        metadata: { ...data, declaredAt: new Date().toISOString() },
      },
    });

    logger.info("In-kind repayment declared", { repaymentId, ...data });

    return { ...updated, amount: Number(updated.amount) };
  }
}
