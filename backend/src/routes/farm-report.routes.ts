import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../middlewares/auth";
import { ApiError } from "../utils/api-error";
import {
  createFarmReport,
  getMyFarmReports,
  getLenderFarmReports,
  uploadFarmReportPhotos,
} from "../controllers/farm-report.controller";

export const farmReportRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(ApiError.badRequest("Only JPEG and PNG photos are allowed"));
    }
  },
});

farmReportRouter.use(authenticate);
farmReportRouter.post("/", authorize("BORROWER"), createFarmReport);
farmReportRouter.post(
  "/upload-photos",
  authorize("BORROWER"),
  upload.array("photos", 5),
  uploadFarmReportPhotos
);
farmReportRouter.get("/me", authorize("BORROWER"), getMyFarmReports);
farmReportRouter.get("/", authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER", "FIELD_AGENT"), getLenderFarmReports);
