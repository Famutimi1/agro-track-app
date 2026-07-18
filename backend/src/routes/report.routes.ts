import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { ReportService, ReportType } from "../services/report.service";
import { ApiError } from "../utils/api-error";

const router = Router();

function parseDateRange(query: any) {
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  const startDate = query.startDate
    ? new Date(query.startDate)
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  return { startDate, endDate };
}

router.use(authenticate);

// Impact metrics for dashboard banner
router.get(
  "/impact",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const metrics = await ReportService.getImpactMetrics(lenderOrgId);
    res.json({ success: true, data: metrics });
  })
);

// Generate a report (async)
router.post(
  "/generate",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const { type, dateFrom, dateTo, format, filters } = req.body;

    const validTypes: ReportType[] = [
      "PORTFOLIO_PERFORMANCE",
      "STATE_BREAKDOWN",
      "CROP_ANALYSIS",
      "GENDER_DEMOGRAPHICS",
      "DEFAULT_RISK",
      "IMPACT_REPORT",
      "FIELD_AGENT_ACTIVITY",
      "AUDIT_EXPORT",
    ];

    if (!type || !validTypes.includes(type)) {
      throw ApiError.badRequest(`Invalid report type. Valid types: ${validTypes.join(", ")}`);
    }

    const result = await ReportService.generateReport(
      lenderOrgId,
      type,
      { dateFrom, dateTo, format, filters },
      req.user!.sub
    );

    res.json({ success: true, data: result });
  })
);

// Get job status
router.get(
  "/jobs/:jobId",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const job = ReportService.getJobStatus(req.params.jobId);
    if (!job) throw ApiError.notFound("Report job not found");
    res.json({ success: true, data: job });
  })
);

// Lender portfolio report (synchronous preview)
router.get(
  "/portfolio",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const range = parseDateRange(req.query);
    const report = await ReportService.getLenderPortfolioReport(lenderOrgId, range);
    res.json({ success: true, data: report });
  })
);

// State breakdown report
router.get(
  "/state-breakdown",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const range = parseDateRange(req.query);
    const report = await ReportService.getStateBreakdownReport(lenderOrgId, range);
    res.json({ success: true, data: report });
  })
);

// Crop analysis report
router.get(
  "/crop-analysis",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const range = parseDateRange(req.query);
    const report = await ReportService.getCropAnalysisReport(lenderOrgId, range);
    res.json({ success: true, data: report });
  })
);

// Gender demographics report
router.get(
  "/gender-demographics",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const report = await ReportService.getGenderDemographicsReport(lenderOrgId);
    res.json({ success: true, data: report });
  })
);

// Default risk / overdue report
router.get(
  "/overdue",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const report = await ReportService.getOverdueReport(lenderOrgId);
    res.json({ success: true, data: report });
  })
);

// Impact report
router.get(
  "/impact-report",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const range = parseDateRange(req.query);
    const report = await ReportService.getImpactReport(lenderOrgId, range);
    res.json({ success: true, data: report });
  })
);

// Field agent activity report
router.get(
  "/field-agents",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const range = parseDateRange(req.query);
    const report = await ReportService.getFieldAgentActivityReport(lenderOrgId, range);
    res.json({ success: true, data: report });
  })
);

// Audit export
router.get(
  "/audit",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const range = parseDateRange(req.query);
    const report = await ReportService.getAuditExport(lenderOrgId, range);
    res.json({ success: true, data: report });
  })
);

// Program report
router.get(
  "/program/:programId",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const range = parseDateRange(req.query);
    const report = await ReportService.getProgramReport(req.params.programId, range);
    res.json({ success: true, data: report });
  })
);

// Borrower statement
router.get(
  "/borrower/:borrowerId/statement",
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
  authorize("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const range = parseDateRange(req.query);
    const report = await ReportService.getPlatformReport(range);
    res.json({ success: true, data: report });
  })
);

export { router as reportRoutes };
