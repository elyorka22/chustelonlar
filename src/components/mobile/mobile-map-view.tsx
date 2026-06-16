"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "@/styles/map-markers.css";
import { MAP_CENTER, MAP_ZOOM } from "@/lib/constants";
import {
  createClusterGroupOptions,
  createSingleCircleIcon,
  createPlacementIcon,
  animateMarkerTap,
  setMarkerSelected,
} from "@/lib/map-markers";
import { MAP_INIT_OPTIONS, MAP_TILE_OPTIONS, MAP_TILE_URL } from "@/lib/map-config";
import { FilterChips } from "@/components/mobile/filter-chips";
import { MapCard } from "@/components/mobile/map-card";
import type { CategoryData, MapAdMarker } from "@/types";

interface MobileMapViewProps {
  ads: MapAdMarker[];
  category: string;
  categories: CategoryData[];
  onCategoryChange: (cat: string) => void;
}

export function MobileMapView({
  ads,
  category,
  categories,
  onCategoryChange,
}: MobileMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const clusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  const markersMap = useRef<Map<string, L.Marker>>(new Map());
  const adsMap = useRef<Map<string, MapAdMarker>>(new Map());
  const [selectedAd, setSelectedAd] = useState<MapAdMarker | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const categoryChips = [
    { label: "Barchasi", value: "" },
    ...categories.map((c) => ({ label: c.shortLabel, value: c.slug })),
  ];

  const handleSelectAd = useCallback((ad: MapAdMarker) => {
    const prevId = selectedIdRef.current;

    if (prevId && prevId !== ad.id) {
      const prevMarker = markersMap.current.get(prevId);
      const prevAd = adsMap.current.get(prevId);
      if (prevMarker && prevAd) {
        setMarkerSelected(prevMarker, false);
      }
    }

    selectedIdRef.current = ad.id;
    setSelectedAd(ad);

    const marker = markersMap.current.get(ad.id);
    if (marker) {
      animateMarkerTap(marker);
      setMarkerSelected(marker, true);
      mapInstance.current?.panTo([ad.latitude, ad.longitude], { animate: true });
    }
  }, []);

  const handleCloseCard = useCallback(() => {
    if (selectedIdRef.current) {
      const marker = markersMap.current.get(selectedIdRef.current);
      const ad = adsMap.current.get(selectedIdRef.current);
      if (marker && ad) {
        setMarkerSelected(marker, false);
      }
    }
    selectedIdRef.current = null;
    setSelectedAd(null);
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      ...MAP_INIT_OPTIONS,
      center: [MAP_CENTER.lat, MAP_CENTER.lng],
      zoom: MAP_ZOOM,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(MAP_TILE_URL, MAP_TILE_OPTIONS).addTo(map);

    const cluster = L.markerClusterGroup(createClusterGroupOptions());

    cluster.on("clusterclick", (e) => {
      const layer = e.layer;
      animateMarkerTap(layer as unknown as L.Marker);
    });

    map.addLayer(cluster);
    mapInstance.current = map;
    clusterGroup.current = cluster;
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [initMap]);

  useEffect(() => {
    if (!clusterGroup.current) return;

    clusterGroup.current.clearLayers();
    markersMap.current.clear();
    adsMap.current.clear();
    selectedIdRef.current = null;
    setSelectedAd(null);

    for (const ad of ads) {
      const icon = createSingleCircleIcon(false);
      const marker = L.marker([ad.latitude, ad.longitude], { icon });

      marker.on("click", () => handleSelectAd(ad));
      clusterGroup.current.addLayer(marker);
      markersMap.current.set(ad.id, marker);
      adsMap.current.set(ad.id, ad);
    }
  }, [ads, handleSelectAd]);

  return (
    <div className="relative h-[calc(100dvh-var(--header-height)-var(--nav-height))] md:h-[calc(100vh-8rem)]">
      <div className="absolute left-0 right-0 top-0 z-[500] bg-white/90 pt-2 pb-2 backdrop-blur-md">
        <FilterChips
          chips={categoryChips}
          active={category}
          onChange={onCategoryChange}
        />
      </div>

      <div ref={mapRef} className="h-full w-full" />

      <MapCard ad={selectedAd} onClose={handleCloseCard} />
    </div>
  );
}

export function MiniMap({
  latitude,
  longitude,
  className,
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      ...MAP_INIT_OPTIONS,
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
    });

    L.tileLayer(MAP_TILE_URL, MAP_TILE_OPTIONS).addTo(map);

    L.marker([latitude, longitude], {
      icon: createPlacementIcon(),
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return (
    <div
      ref={mapRef}
      className={className || "h-44 w-full overflow-hidden rounded-[20px]"}
    />
  );
}
