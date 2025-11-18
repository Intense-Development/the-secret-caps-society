"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

export type StoreLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

// Simple world map GeoJSON URL (using a public CDN)
const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface StoreLocationsMapProps {
  stores: StoreLocation[];
}

/**
 * Store Locations Map Component
 * Displays store locations on a world map
 */
export function StoreLocationsMap({ stores }: StoreLocationsMapProps) {
  return (
    <div className="h-[400px] w-full rounded-lg border bg-background">
      <ComposableMap
        projectionConfig={{
          scale: 147,
          center: [0, 20],
        }}
        className="h-full w-full"
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e2e8f0"
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#cbd5e1" },
                    pressed: { outline: "none", fill: "#94a3b8" },
                  }}
                />
              ))
            }
          </Geographies>
          {stores.map((store) => (
            <Marker
              key={store.id}
              coordinates={[store.lng, store.lat]}
            >
              <circle
                r={6}
                fill="#6366f1"
                stroke="#fff"
                strokeWidth={2}
                className="cursor-pointer transition-all hover:r-8"
              />
              <title>{store.name}</title>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

