"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapContext } from "./map-provider";

interface FarmLocation {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  type?: "farm" | "agent" | "visit";
}

interface FarmMapProps {
  locations?: FarmLocation[];
  center?: [number, number];
  zoom?: number;
  onLocationClick?: (location: FarmLocation) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  selectable?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
  className?: string;
  height?: string;
}

const NIGERIA_CENTER: [number, number] = [8.6753, 9.082];
const NIGERIA_BOUNDS: [[number, number], [number, number]] = [
  [2.668, 4.277],
  [14.68, 13.892],
];

export function FarmMap({
  locations = [],
  center = NIGERIA_CENTER,
  zoom = 6,
  onLocationClick,
  onMapClick,
  selectable = false,
  selectedLocation,
  className = "",
  height = "400px",
}: FarmMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const selectedMarker = useRef<mapboxgl.Marker | null>(null);
  const { isLoaded, accessToken } = useMapContext();
  const [mapReady, setMapReady] = useState(false);

  const clearMarkers = useCallback(() => {
    markers.current.forEach((m) => m.remove());
    markers.current = [];
  }, []);

  useEffect(() => {
    if (!isLoaded || !accessToken || !mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center,
      zoom,
      maxBounds: NIGERIA_BOUNDS,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    map.current.on("load", () => {
      setMapReady(true);
    });

    if (selectable && onMapClick) {
      map.current.on("click", (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    return () => {
      clearMarkers();
      if (selectedMarker.current) {
        selectedMarker.current.remove();
      }
      map.current?.remove();
      map.current = null;
    };
  }, [isLoaded, accessToken, center, zoom, selectable, onMapClick, clearMarkers]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    clearMarkers();

    locations.forEach((location) => {
      const el = document.createElement("div");
      el.className = "farm-marker";
      el.style.cssText = `
        width: 30px;
        height: 30px;
        background-color: ${getMarkerColor(location.type)};
        border-radius: 50%;
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current!);

      if (location.label) {
        marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${location.label}</strong>`));
      }

      if (onLocationClick) {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onLocationClick(location);
        });
      }

      markers.current.push(marker);
    });

    if (locations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach((loc) => {
        bounds.extend([loc.longitude, loc.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [locations, mapReady, onLocationClick, clearMarkers]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (selectedMarker.current) {
      selectedMarker.current.remove();
      selectedMarker.current = null;
    }

    if (selectedLocation) {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 20px;
        height: 20px;
        background-color: #ef4444;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;

      selectedMarker.current = new mapboxgl.Marker(el)
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current);

      map.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 14,
      });
    }
  }, [selectedLocation, mapReady]);

  if (!isLoaded || !accessToken) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-muted-foreground">Map configuration required</p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}

function getMarkerColor(type?: string): string {
  switch (type) {
    case "agent":
      return "#3b82f6";
    case "visit":
      return "#f59e0b";
    case "farm":
    default:
      return "#22c55e";
  }
}
