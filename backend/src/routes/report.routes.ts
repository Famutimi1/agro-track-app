import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { ReportService } from "../services/report.service";

const router = Router();

function parseDateRange(query: any) {
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  const startDate = query.startDate
    ? new Date(query.startDate)
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

  return { startDate, endDate };
}

// Lender reports
router.get(
  "/portfolio",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = (req as any).user.lenderId;
    const range = parseDateRange(req.query);
    const report = await ReportService.getLenderPortfolioReport(lenderOrgId, range);
    res.json({ success: true, data: report });
  })
);

router.get(
  "/program/:programId",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const range = parseDateRange(req.query);
    const report = await ReportService.getProgramReport(req.params.programId, range);
    res.json({ success: true, data: report });
  })
);

router.get(
  "/overdue",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = (req as any).user.lenderId;
    const report = await ReportService.getOverdueReport(lenderOrgId);
    res.json({ success: true, data: report });
  })
);

// Borrower statement
router.get(
  "/borrower/:borrowerId/statement",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const range = parseDateRange(req.query);
    const report = await ReportService.getBorrowerStatement(req.params.borrowerId, range);
    res.json({ success: true, data: report });
  })
);

// Admin platform report
router.get(
  "/platform",
  authenticate,
  authorize("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const range = parseDateRange(req.query);
    const report = await ReportService.getPlatformReport(range);
    res.json({ success: true, data: report });
  })
);

export { router as reportRoutes };
