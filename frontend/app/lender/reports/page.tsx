"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  MapPin,
  AlertTriangle,
  Heart,
  UserCheck,
  Wheat,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  useImpactMetrics,
  useGenerateReport,
  useReportJob,
  usePortfolioReport,
  useStateBreakdownReport,
  useCropAnalysisReport,
  useOverdueReport,
} from "@/lib/hooks/use-reports";
import { ReportType, REPORT_TYPES } from "@/lib/api/reports";

const ICONS: Record<string, React.ElementType> = {
  TrendingUp,
  MapPin,
  Wheat,
  Users,
  AlertTriangle,
  Heart,
  UserCheck,
  FileText,
};

const COLORS: Record<string, { bg: string; text: string }> = {
  blue: { bg: "rgba(37, 99, 235, 0.1)", text: "#2563eb" },
  green: { bg: "rgba(22, 163, 74, 0.1)", text: "#16a34a" },
  amber: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
  purple: { bg: "rgba(124, 58, 237, 0.1)", text: "#7c3aed" },
  red: { bg: "rgba(220, 38, 38, 0.1)", text: "#dc2626" },
  pink: { bg: "rgba(236, 72, 153, 0.1)", text: "#ec4899" },
  cyan: { bg: "rgba(6, 182, 212, 0.1)", text: "#06b6d4" },
  gray: { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280" },
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [format, setFormat] = useState<"PDF" | "CSV" | "XLSX">("PDF");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<ReportType | null>(null);

  const { data: impact, isLoading: impactLoading } = useImpactMetrics();
  const generateReport = useGenerateReport();
  const { data: jobStatus } = useReportJob(activeJobId);

  const { data: portfolioPreview, isLoading: portfolioLoading } = usePortfolioReport(
    previewType === "PORTFOLIO_PERFORMANCE" ? { startDate: dateFrom, endDate: dateTo } : {}
  );
  const { data: statesPreview, isLoading: statesLoading } = useStateBreakdownReport(
    previewType === "STATE_BREAKDOWN" ? { startDate: dateFrom, endDate: dateTo } : {}
  );
  const { data: cropsPreview, isLoading: cropsLoading } = useCropAnalysisReport(
    previewType === "CROP_ANALYSIS" ? { startDate: dateFrom, endDate: dateTo } : {}
  );
  const { data: overduePreview, isLoading: overdueLoading } = useOverdueReport();

  useEffect(() => {
    if (jobStatus?.status === "COMPLETED") {
      setTimeout(() => setActiveJobId(null), 3000);
    }
  }, [jobStatus?.status]);

  const handleGenerate = async () => {
    if (!selectedReport) return;
    try {
      const result = await generateReport.mutateAsync({
        type: selectedReport,
        dateFrom,
        dateTo,
        format,
      });
      setActiveJobId(result.jobId);
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  const handlePreview = (type: ReportType) => {
    setPreviewType(type);
  };

  const formatCurrency = (n: number) => {
    if (n >= 1e9) return `N${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `N${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `N${(n / 1e3).toFixed(0)}K`;
    return `N${n.toLocaleString()}`;
  };

  const formatNumber = (n: number) => {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div>
      {/* Impact Banner */}
      <Card className="mb-6 bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Your Impact</h2>
            <p className="text-sm opacity-80">Real-world outcomes from your lending</p>
          </div>
          <Heart className="w-8 h-8 opacity-60" />
        </div>
        {impactLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : impact ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-2xl font-bold">{formatNumber(impact.farmersFunded)}</p>
              <p className="text-xs opacity-80">Farmers Funded</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(impact.hectaresFarmed)}</p>
              <p className="text-xs opacity-80">Hectares Farmed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(impact.jobsCreated)}</p>
              <p className="text-xs opacity-80">Jobs Created</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(impact.estimatedYieldTonnes)}</p>
              <p className="text-xs opacity-80">Est. Yield (tonnes)</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{impact.fundUtilizationRate}%</p>
              <p className="text-xs opacity-80">Fund Utilization</p>
            </div>
          </div>
        ) : (
          <p className="text-sm opacity-80">No impact data available</p>
        )}
      </Card>

      {/* Active Job Status */}
      {activeJobId && jobStatus && (
        <Card className="mb-6 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            {jobStatus.status === "PROCESSING" && (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            )}
            {jobStatus.status === "COMPLETED" && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {jobStatus.status === "FAILED" && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {jobStatus.status === "PROCESSING" && `Generating ${jobStatus.type.replace(/_/g, " ").toLowerCase()} report... ${jobStatus.progress}%`}
                {jobStatus.status === "COMPLETED" && "Report ready for download!"}
                {jobStatus.status === "FAILED" && `Report generation failed: ${jobStatus.error}`}
              </p>
            </div>
            {jobStatus.status === "COMPLETED" && jobStatus.downloadUrl && (
              <a href={jobStatus.downloadUrl} download>
                <Button size="sm">
                  <Download size={14} /> Download
                </Button>
              </a>
            )}
          </div>
          {jobStatus.status === "PROCESSING" && (
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${jobStatus.progress}%` }}
              />
            </div>
          )}
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Reports</h1>
          <p className="text-[13px] text-[var(--muted)]">
            Generate, preview, and download portfolio reports
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = ICONS[report.icon] || FileText;
          const color = COLORS[report.color] || COLORS.gray;

          return (
            <Card key={report.type} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: color.bg }}
                >
                  <Icon size={18} style={{ color: color.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text)] truncate">
                    {report.name}
                  </h3>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handlePreview(report.type)}
                >
                  <Eye size={13} /> Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedReport(report.type)}
                >
                  <Download size={13} /> Generate
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Generate Modal */}
      <Modal
        open={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        title={`Generate ${REPORT_TYPES.find((r) => r.type === selectedReport)?.name || "Report"}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1 block">
                From Date
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1 block">
                To Date
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1 block">
              Format
            </label>
            <div className="flex gap-2">
              {(["PDF", "CSV", "XLSX"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    format === f
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--muted-bg)] text-[var(--text)] border-transparent hover:border-[var(--border)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setSelectedReport(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleGenerate}
              disabled={generateReport.isPending}
            >
              {generateReport.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Generate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={previewType !== null}
        onClose={() => setPreviewType(null)}
        title={`${REPORT_TYPES.find((r) => r.type === previewType)?.name || "Report"} Preview`}
        wide
      >
        <div className="space-y-4">
          {/* Date Range */}
          <div className="flex items-center gap-4 bg-[var(--muted-bg)] p-3 rounded-lg">
            <Calendar size={16} className="text-[var(--muted)]" />
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-36 h-8 text-sm"
              />
              <span className="text-[var(--muted)]">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-36 h-8 text-sm"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPreviewType(previewType)}
            >
              <RefreshCw size={13} /> Refresh
            </Button>
          </div>

          {/* Preview Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {previewType === "PORTFOLIO_PERFORMANCE" && (
              portfolioLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
                </div>
              ) : portfolioPreview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard
                      label="Total Loans"
                      value={portfolioPreview.portfolio.totalLoans.toString()}
                    />
                    <StatCard
                      label="Active Loans"
                      value={portfolioPreview.portfolio.activeLoans.toString()}
                    />
                    <StatCard
                      label="Repayment Rate"
                      value={`${portfolioPreview.portfolio.repaymentRate}%`}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard
                      label="Total Disbursed"
                      value={formatCurrency(portfolioPreview.portfolio.totalDisbursed)}
                    />
                    <StatCard
                      label="Total Repaid"
                      value={formatCurrency(portfolioPreview.portfolio.totalRepaid)}
                    />
                    <StatCard
                      label="Outstanding"
                      value={formatCurrency(portfolioPreview.portfolio.totalOutstanding)}
                    />
                  </div>
                  {portfolioPreview.byProgram.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">By Program</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-[var(--muted-bg)]">
                            <tr>
                              <th className="px-3 py-2 text-left">Program</th>
                              <th className="px-3 py-2 text-right">Loans</th>
                              <th className="px-3 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {portfolioPreview.byProgram.map((p) => (
                              <tr key={p.programId} className="border-t">
                                <td className="px-3 py-2">{p.programName}</td>
                                <td className="px-3 py-2 text-right">{p.loanCount}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(p.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-[var(--muted)] py-10">No data available</p>
              )
            )}

            {previewType === "STATE_BREAKDOWN" && (
              statesLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
                </div>
              ) : statesPreview?.states?.length ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--muted-bg)]">
                      <tr>
                        <th className="px-3 py-2 text-left">State</th>
                        <th className="px-3 py-2 text-right">Borrowers</th>
                        <th className="px-3 py-2 text-right">Loans</th>
                        <th className="px-3 py-2 text-right">Disbursed</th>
                        <th className="px-3 py-2 text-right">Repaid</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statesPreview.states.map((s) => (
                        <tr key={s.state} className="border-t">
                          <td className="px-3 py-2 font-medium">{s.state}</td>
                          <td className="px-3 py-2 text-right">{s.borrowerCount}</td>
                          <td className="px-3 py-2 text-right">{s.loanCount}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(s.totalDisbursed)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(s.totalRepaid)}</td>
                          <td className="px-3 py-2 text-right">{s.repaymentRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-[var(--muted)] py-10">No data available</p>
              )
            )}

            {previewType === "CROP_ANALYSIS" && (
              cropsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
                </div>
              ) : cropsPreview?.crops?.length ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--muted-bg)]">
                      <tr>
                        <th className="px-3 py-2 text-left">Crop</th>
                        <th className="px-3 py-2 text-right">Farmers</th>
                        <th className="px-3 py-2 text-right">Avg Score</th>
                        <th className="px-3 py-2 text-right">Disbursed</th>
                        <th className="px-3 py-2 text-right">Repayment Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cropsPreview.crops.map((c) => (
                        <tr key={c.crop} className="border-t">
                          <td className="px-3 py-2 font-medium capitalize">{c.crop}</td>
                          <td className="px-3 py-2 text-right">{c.farmerCount}</td>
                          <td className="px-3 py-2 text-right">{c.avgFarmScore}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(c.totalDisbursed)}</td>
                          <td className="px-3 py-2 text-right">{c.repaymentRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-[var(--muted)] py-10">No data available</p>
              )
            )}

            {previewType === "DEFAULT_RISK" && (
              overdueLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
                </div>
              ) : overduePreview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      label="Overdue Count"
                      value={overduePreview.summary.totalOverdueCount.toString()}
                      color="red"
                    />
                    <StatCard
                      label="Overdue Amount"
                      value={formatCurrency(overduePreview.summary.totalOverdueAmount)}
                      color="red"
                    />
                  </div>
                  {Object.entries(overduePreview.byAgeBracket).map(([bracket, items]) => (
                    <div key={bracket}>
                      <h4 className="text-sm font-medium mb-2">{bracket} ({items.length})</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-[var(--muted-bg)]">
                            <tr>
                              <th className="px-3 py-2 text-left">Borrower</th>
                              <th className="px-3 py-2 text-left">Program</th>
                              <th className="px-3 py-2 text-right">Amount</th>
                              <th className="px-3 py-2 text-right">Days</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.slice(0, 5).map((item, i) => (
                              <tr key={i} className="border-t">
                                <td className="px-3 py-2">{item.borrower.name}</td>
                                <td className="px-3 py-2">{item.program}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(item.amount)}</td>
                                <td className="px-3 py-2 text-right text-red-600">{item.daysOverdue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[var(--muted)] py-10">No overdue data</p>
              )
            )}

            {!["PORTFOLIO_PERFORMANCE", "STATE_BREAKDOWN", "CROP_ANALYSIS", "DEFAULT_RISK"].includes(previewType || "") && (
              <div className="text-center py-10">
                <FileText className="w-12 h-12 mx-auto text-[var(--muted)] mb-3" />
                <p className="text-[var(--muted)]">
                  Preview not available for this report type.
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Generate the full report to view data.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setPreviewType(null)}
            >
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setSelectedReport(previewType);
                setPreviewType(null);
              }}
            >
              <Download size={14} /> Generate Full Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "green",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-[var(--muted-bg)] rounded-lg p-3">
      <p className={`text-lg font-bold ${colors[color] || ""}`}>{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
