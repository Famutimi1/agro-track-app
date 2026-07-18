import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createProgramSchema, updateProgramSchema } from "../validators/program.schema";
import {
  createProgram,
  getPrograms,
  getProgram,
  updateProgram,
  toggleProgramStatus,
  updateProgramStatus,
  discoverPrograms,
  getProgramStats,
  closeProgram,
  duplicateProgram,
} from "../controllers/program.controller";

export const programRouter = Router();

programRouter.get("/discover", authenticate, discoverPrograms);

programRouter.use(authenticate, authorize("LENDER_ADMIN", "LENDER_MANAGER"));
programRouter.post("/", validate(createProgramSchema), createProgram);
programRouter.get("/", getPrograms);
programRouter.get("/:id", getProgram);
programRouter.get("/:id/stats", getProgramStats);
programRouter.patch("/:id", validate(updateProgramSchema), updateProgram);
programRouter.patch("/:id/status", updateProgramStatus);
programRouter.patch("/:id/toggle", toggleProgramStatus);
programRouter.post("/:id/close", closeProgram);
programRouter.post("/:id/duplicate", duplicateProgram);
