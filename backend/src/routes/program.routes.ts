import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createProgramSchema, updateProgramSchema } from "../validators/program.schema";
import { createProgram, getPrograms, getProgram, updateProgram, toggleProgramStatus, discoverPrograms } from "../controllers/program.controller";

export const programRouter = Router();

programRouter.get("/discover", authenticate, discoverPrograms);

programRouter.use(authenticate, authorize("LENDER_ADMIN", "LENDER_MANAGER"));
programRouter.post("/", validate(createProgramSchema), createProgram);
programRouter.get("/", getPrograms);
programRouter.get("/:id", getProgram);
programRouter.patch("/:id", validate(updateProgramSchema), updateProgram);
programRouter.patch("/:id/toggle", toggleProgramStatus);
programRouter.patch("/:id/status", validate(z.object({ status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]) })), asyncHandler(async (req, res) => {
  if (!req.user!.lenderId) throw ApiError.forbidden();
  const changed = await prisma.program.updateMany({ where: { id: req.params.id, lenderOrgId: req.user!.lenderId }, data: { status: req.body.status } });
  if (!changed.count) throw ApiError.notFound("Program not found");
  res.json({ success: true, data: await prisma.program.findUniqueOrThrow({ where: { id: req.params.id } }) });
}));
