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

export const updateProgramStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const { status } = req.body;
  if (!["DRAFT", "ACTIVE", "PAUSED", "CLOSED"].includes(status)) {
    throw ApiError.badRequest("Invalid status value");
  }
  const program = await ProgramService.update(req.params.id, req.user.lenderId, { status });
  res.json({ success: true, data: program });
});

export const discoverPrograms = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProgramService.getPublicPrograms(req.query as any);
  res.json({ success: true, ...result });
});

export const getProgramStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const stats = await ProgramService.getStats(req.params.id, req.user.lenderId);
  res.json({ success: true, data: stats });
});

export const closeProgram = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const { forceClose } = req.body;
  const program = await ProgramService.close(req.params.id, req.user.lenderId, forceClose === true);
  res.json({ success: true, data: program });
});

export const duplicateProgram = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const program = await ProgramService.duplicate(req.params.id, req.user.lenderId);
  res.status(201).json({ success: true, data: program });
});
