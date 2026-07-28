import { Request, Response } from "express";
import { FarmReportService } from "../services/farm-report.service";
import { CloudinaryService } from "../services/cloudinary.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const createFarmReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await FarmReportService.create(req.user!.sub, req.body);
  res.status(201).json({ success: true, data: report });
});

export const uploadFarmReportPhotos = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length === 0) throw ApiError.badRequest("No photos provided");

  const uploads = await Promise.all(
    files.map((file) =>
      CloudinaryService.uploadFile(file.buffer, file.mimetype, `farm-reports/${req.user!.sub}`, file.originalname)
    )
  );

  res.json({ success: true, data: { urls: uploads.map((u) => u.url) } });
});

export const getMyFarmReports = asyncHandler(async (req: Request, res: Response) => {
  const result = await FarmReportService.getByBorrower(req.user!.sub, req.query as any);
  res.json({ success: true, ...result });
});

export const getLenderFarmReports = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const result = await FarmReportService.getByLender(req.user.lenderId, req.query as any);
  res.json({ success: true, ...result });
});
