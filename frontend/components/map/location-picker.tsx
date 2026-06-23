"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FarmMap } from "./farm-map";

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number } | null) => void;
  label?: string;
  description?: string;
}

export function LocationPicker({
  value,
  onChange,
  label = "Farm Location",
  description = "Click on the map to select your farm location",
}: LocationPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setError(null);
    onChange(coords);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (err) => {
        setError(err.message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleClear = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">{label}</label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <FarmMap
        selectable
        selectedLocation={value}
        onMapClick={handleMapClick}
        height="300px"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? "Getting location..." : "Use Current Location"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {value && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Latitude</label>
            <Input value={value.lat.toFixed(6)} readOnly className="bg-muted" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Longitude</label>
            <Input value={value.lng.toFixed(6)} readOnly className="bg-muted" />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
