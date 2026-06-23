import { Router } from "express";
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
