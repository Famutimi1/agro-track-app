import { Request, Response } from "express";
import { ProgramService } from "../services/program.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const program = await ProgramService.create(req.user.lenderId, req.body);
  res.status(201).json({ success: true, data: program });
});

export const getPrograms = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const result = await ProgramService.getAll(req.user.lenderId, req.query as any);
  res.json({ success: true, ...result });
});

export const getProgram = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const program = await ProgramService.getById(req.params.id, req.user.lenderId);
  res.json({ success: true, data: program });
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const program = await ProgramService.update(req.params.id, req.user.lenderId, req.body);
  res.json({ success: true, data: program });
});

export const toggleProgramStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const program = await ProgramService.toggleStatus(req.params.id, req.user.lenderId);
  res.json({ success: true, data: program });
});

export const discoverPrograms = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProgramService.getPublicPrograms(req.query as any);
  res.json({ success: true, ...result });
});
