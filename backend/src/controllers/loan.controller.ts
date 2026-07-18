import { Request, Response } from "express";
import { LoanService } from "../services/loan.service";
import { ApiError } from "../utils/api-error";

async function assertLoanAccess(req: Request, loanId: string) {
  if (req.user!.role === "BORROWER") {
    const owns = await LoanService.borrowerOwnsLoan(loanId, req.user!.sub);
    if (!owns) throw ApiError.forbidden("You do not have access to this loan");
  }
}

export class LoanController {
  static async list(req: Request, res: Response) {
    const lenderOrgId = req.user!.lenderOrgId || req.user!.lenderId;
    if (!lenderOrgId) {
      res.status(403).json({ success: false, message: "Lender organization required" });
      return;
    }
    const result = await LoanService.listForLender(lenderOrgId, req.query as any);
    res.json({ success: true, ...result });
  }

  static async listMine(req: Request, res: Response) {
    const result = await LoanService.listForBorrower(req.user!.sub);
    res.json({ success: true, ...result });
  }

  static async getById(req: Request, res: Response) {
    await assertLoanAccess(req, req.params.id);
    const loan = await LoanService.getById(req.params.id);
    res.json({ success: true, data: loan });
  }

  static async getRepaymentSchedule(req: Request, res: Response) {
    await assertLoanAccess(req, req.params.id);
    const schedule = await LoanService.getRepaymentSchedule(req.params.id);
    res.json({ success: true, data: schedule });
  }

  static async getTimeline(req: Request, res: Response) {
    await assertLoanAccess(req, req.params.id);
    const timeline = await LoanService.getTimeline(req.params.id);
    res.json({ success: true, data: timeline });
  }

  static async getStats(req: Request, res: Response) {
    const lenderOrgId = req.user!.lenderOrgId || req.user!.lenderId;
    if (!lenderOrgId) {
      res.status(403).json({ success: false, message: "Lender organization required" });
      return;
    }
    const stats = await LoanService.getStats(lenderOrgId);
    res.json({ success: true, data: stats });
  }

  static async restructure(req: Request, res: Response) {
    const reviewerId = req.user!.sub;
    const loan = await LoanService.restructure(reviewerId, req.params.id, req.body);
    res.json({ success: true, data: loan });
  }

  static async writeOff(req: Request, res: Response) {
    const reviewerId = req.user!.sub;
    const loan = await LoanService.writeOff(reviewerId, req.params.id, req.body);
    res.json({ success: true, data: loan });
  }
}
