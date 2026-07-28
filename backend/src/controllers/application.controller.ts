import { Request, Response } from "express";
import { ApplicationService } from "../services/application.service";

export class ApplicationController {
  static async create(req: Request, res: Response) {
    const userId = req.user!.sub;
    const application = await ApplicationService.create(userId, req.body);
    res.status(201).json({ success: true, data: application });
  }

  static async getEligibility(req: Request, res: Response) {
    const userId = req.user!.sub;
    const amount = req.query.amount ? Number(req.query.amount) : undefined;
    const result = await ApplicationService.checkEligibility(userId, req.params.programId, amount);
    res.json({ success: true, data: result });
  }

  static async submit(req: Request, res: Response) {
    const userId = req.user!.sub;
    const application = await ApplicationService.submit(userId, req.params.id);
    res.json({ success: true, data: application });
  }

  static async update(req: Request, res: Response) {
    const userId = req.user!.sub;
    const application = await ApplicationService.updateDraft(userId, req.params.id, req.body);
    res.json({ success: true, data: application });
  }

  static async withdraw(req: Request, res: Response) {
    const userId = req.user!.sub;
    const application = await ApplicationService.withdraw(userId, req.params.id);
    res.json({ success: true, data: application });
  }

  static async approve(req: Request, res: Response) {
    const reviewerId = req.user!.sub;
    const application = await ApplicationService.approve(reviewerId, req.params.id, req.body);
    res.json({ success: true, data: application });
  }

  static async reject(req: Request, res: Response) {
    const reviewerId = req.user!.sub;
    const application = await ApplicationService.reject(reviewerId, req.params.id, req.body);
    res.json({ success: true, data: application });
  }

  static async requestInfo(req: Request, res: Response) {
    const reviewerId = req.user!.sub;
    const application = await ApplicationService.requestInfo(reviewerId, req.params.id, req.body);
    res.json({ success: true, data: application });
  }

  static async bulkAction(req: Request, res: Response) {
    const reviewerId = req.user!.sub;
    const lenderOrgId = req.user!.lenderOrgId || req.user!.lenderId;
    if (!lenderOrgId) {
      res.status(403).json({ success: false, message: "Lender organization required" });
      return;
    }
    const result = await ApplicationService.bulkAction(reviewerId, lenderOrgId, req.body);
    res.json({ success: true, data: result });
  }

  // Legacy method kept for backward compatibility
  static async review(req: Request, res: Response) {
    const reviewerId = req.user!.sub;
    const application = await ApplicationService.review(reviewerId, req.params.id, req.body);
    res.json({ success: true, data: application });
  }

  static async listForBorrower(req: Request, res: Response) {
    const userId = req.user!.sub;
    const result = await ApplicationService.listForBorrower(userId, req.query as any);
    res.json({ success: true, ...result });
  }

  static async listForLender(req: Request, res: Response) {
    const lenderOrgId = req.user!.lenderOrgId || req.user!.lenderId;
    if (!lenderOrgId) {
      res.status(403).json({ success: false, message: "Lender organization required" });
      return;
    }
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

  static async uploadDocuments(req: Request, res: Response) {
    const userId = req.user!.sub;
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      res.status(400).json({ success: false, message: "No documents provided" });
      return;
    }

    const type = req.body.type as string | undefined;
    const documents = await ApplicationService.uploadDocuments(
      userId,
      req.params.id,
      files.map((file) => ({
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        type: type as any,
      }))
    );
    res.status(201).json({ success: true, data: documents });
  }

  static async respondInfo(req: Request, res: Response) {
    const userId = req.user!.sub;
    const application = await ApplicationService.respondToInfoRequest(userId, req.params.id, req.body);
    res.json({ success: true, data: application });
  }
}
