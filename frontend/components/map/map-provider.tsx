"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import mapboxgl from "mapbox-gl";

interface MapContextValue {
  isLoaded: boolean;
  accessToken: string | null;
}

const MapContext = createContext<MapContextValue>({ isLoaded: false, accessToken: null });

export function useMapContext() {
  return useContext(MapContext);
}

interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || null;

  useEffect(() => {
    if (accessToken) {
      mapboxgl.accessToken = accessToken;
      setIsLoaded(true);
    }
  }, [accessToken]);

  return (
    <MapContext.Provider value={{ isLoaded, accessToken }}>
      {children}
    </MapContext.Provider>
  );
}
