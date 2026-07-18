"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  MapPin,
  Filter,
  Layers,
  Eye,
  Users,
  AlertTriangle,
  TrendingUp,
  X,
  ChevronRight,
  Loader2,
  UserCircle,
} from "lucide-react";
import {
  useBorrowerLocations,
  useStateStats,
  useMapSummary,
  useMapCrops,
} from "@/lib/hooks/use-map";
import { usePrograms } from "@/lib/hooks/use-programs";
import {
  BorrowerLocation,
  BorrowerStatus,
  STATUS_COLORS,
  MapFilters,
} from "@/lib/api/map";

const NIGERIA_STATES_COORDS: Record<string, { x: number; y: number }> = {
  Abia: { x: 295, y: 340 },
  Adamawa: { x: 380, y: 200 },
  "Akwa Ibom": { x: 280, y: 380 },
  Anambra: { x: 270, y: 320 },
  Bauchi: { x: 340, y: 160 },
  Bayelsa: { x: 240, y: 390 },
  Benue: { x: 310, y: 260 },
  Borno: { x: 400, y: 100 },
  "Cross River": { x: 305, y: 360 },
  Delta: { x: 230, y: 350 },
  Ebonyi: { x: 300, y: 310 },
  Edo: { x: 220, y: 310 },
  Ekiti: { x: 175, y: 270 },
  Enugu: { x: 280, y: 290 },
  FCT: { x: 260, y: 220 },
  Gombe: { x: 365, y: 160 },
  Imo: { x: 270, y: 340 },
  Jigawa: { x: 335, y: 95 },
  Kaduna: { x: 275, y: 155 },
  Kano: { x: 310, y: 100 },
  Katsina: { x: 270, y: 80 },
  Kebbi: { x: 170, y: 115 },
  Kogi: { x: 250, y: 260 },
  Kwara: { x: 185, y: 220 },
  Lagos: { x: 130, y: 310 },
  Nasarawa: { x: 300, y: 220 },
  Niger: { x: 220, y: 175 },
  Ogun: { x: 140, y: 285 },
  Ondo: { x: 175, y: 300 },
  Osun: { x: 160, y: 265 },
  Oyo: { x: 145, y: 245 },
  Plateau: { x: 320, y: 200 },
  Rivers: { x: 260, y: 375 },
  Sokoto: { x: 195, y: 80 },
  Taraba: { x: 360, y: 235 },
  Yobe: { x: 380, y: 95 },
  Zamfara: { x: 230, y: 100 },
};

export default function MapViewPage() {
  const [filters, setFilters] = useState<MapFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<BorrowerLocation | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<"borrowers" | "heatmap" | "agents">("borrowers");
  const [heatmapMetric, setHeatmapMetric] = useState<"repayment" | "farmScore" | "density">("density");

  const { data: locations, isLoading: locationsLoading } = useBorrowerLocations(filters);
  const { data: stateStats, isLoading: statsLoading } = useStateStats();
  const { data: summary } = useMapSummary();
  const { data: crops } = useMapCrops();
  const { data: programsData } = usePrograms({ limit: 100 });

  const programs = programsData?.data || [];

  const clusteredLocations = useMemo(() => {
    if (!locations) return [];

    const clusters: Record<string, { locations: BorrowerLocation[]; x: number; y: number }> = {};

    locations.forEach((loc) => {
      const coords = NIGERIA_STATES_COORDS[loc.state];
      if (!coords) return;

      const key = loc.state;
      if (!clusters[key]) {
        clusters[key] = { locations: [], x: coords.x, y: coords.y };
      }
      clusters[key].locations.push(loc);
    });

    return Object.entries(clusters).map(([state, data]) => ({
      state,
      count: data.locations.length,
      x: data.x,
      y: data.y,
      locations: data.locations,
      statuses: data.locations.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    }));
  }, [locations]);

  const handleFilterChange = (key: keyof MapFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const formatCurrency = (n: number) => {
    if (n >= 1e9) return `N${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `N${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `N${(n / 1e3).toFixed(0)}K`;
    return `N${n.toLocaleString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Map View</h1>
          <p className="text-[13px] text-[var(--muted)]">
            Geographic distribution of {summary?.totalBorrowers || 0} borrowers across {summary?.statesWithBorrowers || 0} states
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] text-white text-[10px] rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Users size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text)]">
                {locations?.filter((l) => l.status === "ACTIVE").length || 0}
              </p>
              <p className="text-[10px] text-[var(--muted)]">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text)]">
                {locations?.filter((l) => l.status === "AT_RISK").length || 0}
              </p>
              <p className="text-[10px] text-[var(--muted)]">At Risk</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle size={14} className="text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text)]">
                {locations?.filter((l) => l.status === "DEFAULTING").length || 0}
              </p>
              <p className="text-[10px] text-[var(--muted)]">Defaulting</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text)]">
                {locations?.filter((l) => l.status === "COMPLETED").length || 0}
              </p>
              <p className="text-[10px] text-[var(--muted)]">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters Panel */}
        {showFilters && (
          <Card className="lg:col-span-1 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text)]">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] mb-1 block">
                  Program
                </label>
                <select
                  value={filters.programId || ""}
                  onChange={(e) => handleFilterChange("programId", e.target.value)}
                  className="w-full h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
                >
                  <option value="">All Programs</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted)] mb-1 block">
                  Status
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value as BorrowerStatus)}
                  className="w-full h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_COLORS).map(([status, { label }]) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted)] mb-1 block">
                  State
                </label>
                <select
                  value={filters.state || ""}
                  onChange={(e) => handleFilterChange("state", e.target.value)}
                  className="w-full h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
                >
                  <option value="">All States</option>
                  {Object.keys(NIGERIA_STATES_COORDS).sort().map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted)] mb-1 block">
                  Crop Type
                </label>
                <select
                  value={filters.crop || ""}
                  onChange={(e) => handleFilterChange("crop", e.target.value)}
                  className="w-full h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
                >
                  <option value="">All Crops</option>
                  {crops?.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted)] mb-1 block">
                  FarmScore Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minFarmScore || ""}
                    onChange={(e) => handleFilterChange("minFarmScore", parseInt(e.target.value) || undefined)}
                    className="h-9 text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxFarmScore || ""}
                    onChange={(e) => handleFilterChange("maxFarmScore", parseInt(e.target.value) || undefined)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Map */}
        <Card className={`${showFilters ? "lg:col-span-2" : "lg:col-span-3"} relative min-h-[500px]`}>
          {/* Overlay Controls */}
          <div className="absolute top-3 left-3 z-10 flex gap-1 bg-white/90 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveOverlay("borrowers")}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                activeOverlay === "borrowers"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--muted-bg)]"
              }`}
            >
              <MapPin size={12} className="inline mr-1" />
              Borrowers
            </button>
            <button
              onClick={() => setActiveOverlay("heatmap")}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                activeOverlay === "heatmap"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--muted-bg)]"
              }`}
            >
              <Layers size={12} className="inline mr-1" />
              Heatmap
            </button>
          </div>

          {activeOverlay === "heatmap" && (
            <div className="absolute top-3 right-3 z-10 flex gap-1 bg-white/90 rounded-lg p-1 shadow-sm">
              {(["density", "repayment", "farmScore"] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setHeatmapMetric(metric)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                    heatmapMetric === metric
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                  }`}
                >
                  {metric === "density" ? "Density" : metric === "repayment" ? "Repayment" : "Score"}
                </button>
              ))}
            </div>
          )}

          {locationsLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
            </div>
          ) : (
            <svg viewBox="0 0 500 450" className="w-full h-full">
              {/* Nigeria outline */}
              <path
                d="M120,60 L180,50 L240,55 L300,45 L360,50 L420,70 L440,120 L430,180 L410,240 L380,280 L340,320 L300,360 L260,400 L220,410 L180,395 L140,360 L110,310 L90,260 L80,200 L90,140 L100,100 Z"
                fill="var(--muted-bg)"
                stroke="var(--border)"
                strokeWidth="2"
              />

              {/* State boundaries (simplified) */}
              {Object.entries(NIGERIA_STATES_COORDS).map(([state, { x, y }]) => {
                const stats = stateStats?.find((s) => s.state === state);
                const cluster = clusteredLocations.find((c) => c.state === state);

                if (activeOverlay === "heatmap" && stats) {
                  let intensity = 0;
                  if (heatmapMetric === "density") {
                    intensity = Math.min(stats.borrowerCount / 50, 1);
                  } else if (heatmapMetric === "repayment") {
                    intensity = stats.repaymentRate / 100;
                  } else {
                    intensity = stats.avgFarmScore / 850;
                  }

                  const color = heatmapMetric === "repayment" || heatmapMetric === "farmScore"
                    ? `rgba(22, 163, 74, ${intensity})`
                    : `rgba(37, 99, 235, ${intensity})`;

                  return (
                    <circle
                      key={state}
                      cx={x}
                      cy={y}
                      r={25 + intensity * 15}
                      fill={color}
                      opacity={0.6}
                    />
                  );
                }

                return null;
              })}

              {/* Borrower clusters */}
              {activeOverlay === "borrowers" && clusteredLocations.map((cluster) => {
                const dominantStatus = Object.entries(cluster.statuses).sort(
                  (a, b) => b[1] - a[1]
                )[0]?.[0] as BorrowerStatus || "ACTIVE";
                const color = STATUS_COLORS[dominantStatus]?.color || "#16a34a";

                return (
                  <g
                    key={cluster.state}
                    className="cursor-pointer"
                    onClick={() => {
                      if (cluster.count === 1) {
                        setSelectedBorrower(cluster.locations[0]);
                      } else {
                        handleFilterChange("state", cluster.state);
                      }
                    }}
                  >
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={Math.min(8 + cluster.count * 0.5, 25)}
                      fill={color}
                      opacity={0.8}
                    />
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={Math.min(12 + cluster.count * 0.5, 35)}
                      fill={color}
                      opacity={0.2}
                    />
                    {cluster.count > 1 && (
                      <text
                        x={cluster.x}
                        y={cluster.y + 4}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-white pointer-events-none"
                      >
                        {cluster.count}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-white/95 rounded-lg p-2 shadow-sm">
            <p className="text-[10px] font-bold text-[var(--text)] mb-1">Legend</p>
            <div className="space-y-1">
              {Object.entries(STATUS_COLORS).map(([status, { color, label }]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-[10px] text-[var(--muted)]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* State Stats Panel */}
        <Card className="lg:col-span-1 max-h-[600px] overflow-y-auto">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">By State</h3>

          {statsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
            </div>
          ) : stateStats?.length ? (
            <div className="space-y-2">
              {stateStats.map((state) => (
                <button
                  key={state.state}
                  onClick={() => handleFilterChange("state", state.state === filters.state ? undefined : state.state)}
                  className={`w-full text-left p-2 rounded-lg border transition hover:bg-[var(--muted-bg)] ${
                    filters.state === state.state
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[var(--text)]">
                      {state.state}
                    </span>
                    <span className="text-xs font-bold text-[var(--text)]">
                      {state.borrowerCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
                    <span>{formatCurrency(state.totalDisbursed)}</span>
                    <span>|</span>
                    <span className={state.repaymentRate >= 80 ? "text-green-600" : state.repaymentRate >= 60 ? "text-amber-600" : "text-red-600"}>
                      {state.repaymentRate}% repaid
                    </span>
                  </div>
                  {(state.atRiskCount > 0 || state.defaultingCount > 0) && (
                    <div className="flex items-center gap-2 mt-1">
                      {state.atRiskCount > 0 && (
                        <span className="text-[10px] text-amber-600">
                          {state.atRiskCount} at risk
                        </span>
                      )}
                      {state.defaultingCount > 0 && (
                        <span className="text-[10px] text-red-600">
                          {state.defaultingCount} defaulting
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[var(--muted)] py-8">
              No state data available
            </p>
          )}
        </Card>
      </div>

      {/* Borrower Detail Modal */}
      <Modal
        open={selectedBorrower !== null}
        onClose={() => setSelectedBorrower(null)}
        title="Borrower Details"
      >
        {selectedBorrower && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--muted-bg)] flex items-center justify-center">
                <UserCircle size={24} className="text-[var(--muted)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text)]">{selectedBorrower.name}</h4>
                <p className="text-xs text-[var(--muted)]">{selectedBorrower.farmerId}</p>
              </div>
              <div
                className={`ml-auto px-2 py-1 rounded-full text-[10px] font-medium ${STATUS_COLORS[selectedBorrower.status].bg}`}
                style={{ color: STATUS_COLORS[selectedBorrower.status].color }}
              >
                {STATUS_COLORS[selectedBorrower.status].label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--muted-bg)] rounded-lg p-3">
                <p className="text-lg font-bold text-[var(--text)]">{selectedBorrower.farmScore}</p>
                <p className="text-[10px] text-[var(--muted)]">FarmScore ({selectedBorrower.farmScoreTier})</p>
              </div>
              <div className="bg-[var(--muted-bg)] rounded-lg p-3">
                <p className="text-lg font-bold text-[var(--text)]">
                  {formatCurrency(selectedBorrower.loanAmount)}
                </p>
                <p className="text-[10px] text-[var(--muted)]">Total Loans</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-xs text-[var(--muted)]">Location</span>
                <span className="text-xs font-medium text-[var(--text)]">
                  {selectedBorrower.lga}, {selectedBorrower.state}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-xs text-[var(--muted)]">Primary Crop</span>
                <span className="text-xs font-medium text-[var(--text)] capitalize">
                  {selectedBorrower.primaryCrop}
                </span>
              </div>
              {selectedBorrower.cooperative && (
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-xs text-[var(--muted)]">Cooperative</span>
                  <span className="text-xs font-medium text-[var(--text)]">
                    {selectedBorrower.cooperative}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedBorrower(null)}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  window.location.href = `/lender/borrowers/${selectedBorrower.id}`;
                }}
              >
                View Profile <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
