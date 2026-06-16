"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "@/styles/map-markers.css";
import { MAP_CENTER, MAP_ZOOM } from "@/lib/constants";
import {
  createClusterGroupOptions,
  createSingleCircleIcon,
  animateMarkerTap,
} from "@/lib/map-markers";
import { MAP_INIT_OPTIONS, MAP_TILE_OPTIONS, MAP_TILE_URL } from "@/lib/map-config";
import type { MapAdMarker } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsMapProps {
  ads: MapAdMarker[];
  mode?: "heatmap" | "ads";
}

export function AnalyticsMap({ ads, mode = "ads" }: AnalyticsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const clusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  const [ready, setReady] = useState(false);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      ...MAP_INIT_OPTIONS,
      center: [MAP_CENTER.lat, MAP_CENTER.lng],
      zoom: MAP_ZOOM - 1,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer(MAP_TILE_URL, MAP_TILE_OPTIONS).addTo(map);

    const cluster = L.markerClusterGroup(createClusterGroupOptions());
    map.addLayer(cluster);
    mapInstance.current = map;
    clusterGroup.current = cluster;
    setReady(true);
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      setReady(false);
    };
  }, [initMap]);

  useEffect(() => {
    if (!clusterGroup.current || !ready) return;

    clusterGroup.current.clearLayers();

    for (const ad of ads) {
      const icon = createSingleCircleIcon(false);
      const marker = L.marker([ad.latitude, ad.longitude], { icon });
      marker.bindPopup(`<b>${ad.title}</b><br/>${ad.district}`);
      marker.on("click", () => animateMarkerTap(marker));
      clusterGroup.current.addLayer(marker);
    }

    if (ads.length > 0 && mapInstance.current) {
      const bounds = L.latLngBounds(ads.map((a) => [a.latitude, a.longitude]));
      mapInstance.current.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    }
  }, [ads, ready, mode]);

  return (
    <div className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
      {!ready && (
        <Skeleton className="absolute inset-0 z-10 h-[280px] w-full rounded-[22px]" />
      )}
      <div ref={mapRef} className="h-[280px] w-full" />
    </div>
  );
}
