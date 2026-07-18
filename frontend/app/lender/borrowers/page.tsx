"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
  Download, MapPin, TrendingUp, User, Leaf, Eye
} from "lucide-react";
import {
  borrowersApi,
  type BorrowerProfile,
  type BorrowersQuery,
  FARM_SCORE_TIERS,
} from "@/lib/api/borrowers";

const cropColors: Record<string, { bg: string; color: string }> = {
  Rice: { bg: "#dcfce7", color: "#166534" },
  Cassava: { bg: "#fef3c7", color: "#854d0e" },
  Maize: { bg: "#dbeafe", color: "#1e40af" },
  Yam: { bg: "#fed7aa", color: "#9a3412" },
  Cocoa: { bg: "#d1fae5", color: "#065f46" },
  Cashew: { bg: "#fce7f3", color: "#9d174d" },
  Tomato: { bg: "#fee2e2", color: "#991b1b" },
  Sorghum: { bg: "#ede9fe", color: "#5b21b6" },
  Wheat: { bg: "#e0f2fe", color: "#0c4a6e" },
};

export default function BorrowersPage() {
  const router = useRouter();

  const [borrowers, setBorrowers] = useState<BorrowerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [cropFilter, setCropFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<BorrowersQuery["sortBy"]>("newest");

  const fetchBorrowers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const query: BorrowersQuery = {
        page,
        limit: 20,
        sortBy,
        search: search || undefined,
      };
      if (stateFilter !== "ALL") query.state = stateFilter;
      if (cropFilter !== "ALL") query.crop = cropFilter;
      if (tierFilter !== "ALL") query.tier = tierFilter;

      const response = await borrowersApi.list(query);
      setBorrowers(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error("Failed to fetch borrowers:", err);
      setError("Failed to load borrowers. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, stateFilter, cropFilter, tierFilter, sortBy]);

  useEffect(() => {
    fetchBorrowers();
  }, [fetchBorrowers]);

  const exportToCsv = () => {
    const headers = ["Farmer ID", "Name", "Email", "Phone", "State", "LGA", "Primary Crop", "Farm Size (Ha)", "FarmScore", "Tier", "Loans"];
    const rows = borrowers.map((b) => [
      b.farmerId,
      `${b.user.firstName} ${b.user.lastName}`,
      b.user.email,
      b.user.phone || "",
      b.state,
      b.lga,
      b.primaryCrop,
      b.farmSizeHa,
      b.farmScore,
      b.farmScoreTier,
      b._count?.loans || 0,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `borrowers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTierStyle = (tier: string) => {
    const config = FARM_SCORE_TIERS[tier] || FARM_SCORE_TIERS.POOR;
    return config;
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Borrowers</h1>
          <p className="text-sm text-[var(--muted)]">
            {loading ? "Loading..." : `${total} registered farmers across all programs`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchBorrowers(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)]"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by name, email, or farmer ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All States</option>
          <option value="Kebbi">Kebbi</option>
          <option value="Kano">Kano</option>
          <option value="Kaduna">Kaduna</option>
          <option value="Niger">Niger</option>
          <option value="Benue">Benue</option>
          <option value="Oyo">Oyo</option>
          <option value="Lagos">Lagos</option>
        </select>
        <select
          value={cropFilter}
          onChange={(e) => { setCropFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Crops</option>
          <option value="Rice">Rice</option>
          <option value="Maize">Maize</option>
          <option value="Cassava">Cassava</option>
          <option value="Yam">Yam</option>
          <option value="Cocoa">Cocoa</option>
          <option value="Tomato">Tomato</option>
        </select>
        <select
          value={tierFilter}
          onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Tiers</option>
          <option value="EXCELLENT">Platinum (800+)</option>
          <option value="GOOD">Gold (700-799)</option>
          <option value="FAIR">Silver (500-699)</option>
          <option value="POOR">Bronze (300-499)</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as BorrowersQuery["sortBy"]); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highestScore">Highest Score</option>
          <option value="lowestScore">Lowest Score</option>
          <option value="mostLoans">Most Loans</option>
        </select>
      </div>

      {/* Borrowers Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Farmer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Location</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Crop</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Farm Size</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">FarmScore</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Loans</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">KYC</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted)]">Loading...</td>
              </tr>
            ) : borrowers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted)]">No borrowers found</td>
              </tr>
            ) : borrowers.map((borrower) => {
              const fullName = `${borrower.user.firstName} ${borrower.user.lastName}`;
              const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase();
              const tierStyle = getTierStyle(borrower.farmScoreTier);
              const cropStyle = cropColors[borrower.primaryCrop] || { bg: "#f3f4f6", color: "#6b7280" };

              return (
                <tr key={borrower.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{fullName}</p>
                        <p className="text-xs text-[var(--muted)]">{borrower.farmerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-[var(--muted)]">
                      <MapPin size={12} />
                      <span>{borrower.lga}, {borrower.state}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: cropStyle.bg, color: cropStyle.color }}
                    >
                      {borrower.primaryCrop}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text)]">
                    {borrower.farmSizeHa} ha
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${
                        borrower.farmScore >= 700 ? "text-green-600" :
                        borrower.farmScore >= 500 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {borrower.farmScore}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tierStyle.bg} ${tierStyle.color}`}>
                        {tierStyle.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text)]">
                    {borrower._count?.loans || 0}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <span className={`w-2 h-2 rounded-full ${borrower.bvnVerified ? "bg-green-500" : "bg-red-500"}`} title="BVN" />
                      <span className={`w-2 h-2 rounded-full ${borrower.ninVerified ? "bg-green-500" : "bg-red-500"}`} title="NIN" />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/lender/borrowers/${borrower.id}`}
                      className="inline-flex items-center gap-1 text-sm text-brand-green hover:underline"
                    >
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-[var(--muted)]">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
