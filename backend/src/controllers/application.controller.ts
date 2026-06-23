import { Request, Response } from "express";
import { ApplicationService } from "../services/application.service";

export class ApplicationController {
  static async create(req: Request, res: Response) {
    const userId = (req as any).user.sub;
    const application = await ApplicationService.create(userId, req.body);
    res.status(201).json({ success: true, data: application });
  }

  static async submit(req: Request, res: Response) {
    const userId = (req as any).user.sub;
    const application = await ApplicationService.submit(userId, req.params.id);
    res.json({ success: true, data: application });
  }

  static async withdraw(req: Request, res: Response) {
    const userId = (req as any).user.sub;
    const application = await ApplicationService.withdraw(userId, req.params.id);
    res.json({ success: true, data: application });
  }

  static async review(req: Request, res: Response) {
    const reviewerId = (req as any).user.sub;
    const application = await ApplicationService.review(reviewerId, req.params.id, req.body);
    res.json({ success: true, data: application });
  }

  static async listForBorrower(req: Request, res: Response) {
    const userId = (req as any).user.sub;
    const result = await ApplicationService.listForBorrower(userId, req.query as any);
    res.json({ success: true, ...result });
  }

  static async listForLender(req: Request, res: Response) {
    const lenderOrgId = (req as any).user.lenderId;
    const result = await ApplicationService.listForLender(lenderOrgId, req.query as any);
    res.json({ success: true, ...result });
  }

  static async getById(req: Request, res: Response) {
    const application = await ApplicationService.getById(req.params.id);
    res.json({ success: true, data: application });
  }

  static async markUnderReview(req: Request, res: Response) {
    const application = await ApplicationService.markUnderReview(req.params.id);
    res.json({ success: true, data: application });
  }
}
