import { useQuery } from "@tanstack/react-query";
import { mapApi, MapFilters } from "../api/map";

export const mapKeys = {
  all: ["map"] as const,
  borrowers: (filters: MapFilters) => [...mapKeys.all, "borrowers", filters] as const,
  states: () => [...mapKeys.all, "states"] as const,
  heatmap: (metric: string) => [...mapKeys.all, "heatmap", metric] as const,
  summary: () => [...mapKeys.all, "summary"] as const,
  agents: () => [...mapKeys.all, "agents"] as const,
  crops: () => [...mapKeys.all, "crops"] as const,
};

export function useBorrowerLocations(filters: MapFilters = {}) {
  return useQuery({
    queryKey: mapKeys.borrowers(filters),
    queryFn: () => mapApi.getBorrowerLocations(filters),
  });
}

export function useStateStats() {
  return useQuery({
    queryKey: mapKeys.states(),
    queryFn: () => mapApi.getStateStats(),
  });
}

export function useHeatmapData(metric: "repayment" | "farmScore" | "density" = "density") {
  return useQuery({
    queryKey: mapKeys.heatmap(metric),
    queryFn: () => mapApi.getHeatmapData(metric),
  });
}

export function useMapSummary() {
  return useQuery({
    queryKey: mapKeys.summary(),
    queryFn: () => mapApi.getSummary(),
  });
}

export function useFieldAgentZones() {
  return useQuery({
    queryKey: mapKeys.agents(),
    queryFn: () => mapApi.getFieldAgentZones(),
  });
}

export function useMapCrops() {
  return useQuery({
    queryKey: mapKeys.crops(),
    queryFn: () => mapApi.getCrops(),
  });
}
