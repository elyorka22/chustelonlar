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
  createChegirmaCircleIcon,
  animateMarkerTap,
  setChegirmaMarkerSelected,
} from "@/lib/map-markers";
import { MAP_INIT_OPTIONS, MAP_TILE_OPTIONS, MAP_TILE_URL } from "@/lib/map-config";
import { FilterChips } from "@/components/mobile/filter-chips";
import { ChegirmaMapCard } from "@/components/mobile/chegirma-map-card";
import { CHEGIRMA_CATEGORIES } from "@/lib/chegirma-constants";
import type { MapChegirmaMarker } from "@/types";

interface ChegirmaMapViewProps {
  items: MapChegirmaMarker[];
  category: string;
  onCategoryChange: (cat: string) => void;
}

export function ChegirmaMapView({
  items,
  category,
  onCategoryChange,
}: ChegirmaMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const clusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  const markersMap = useRef<Map<string, L.Marker>>(new Map());
  const itemsMap = useRef<Map<string, MapChegirmaMarker>>(new Map());
  const [selected, setSelected] = useState<MapChegirmaMarker | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const categoryChips = [
    { label: "Barchasi", value: "" },
    ...CHEGIRMA_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
  ];

  const handleSelect = useCallback((item: MapChegirmaMarker) => {
    const prevId = selectedIdRef.current;

    if (prevId && prevId !== item.id) {
      const prevMarker = markersMap.current.get(prevId);
      if (prevMarker) setChegirmaMarkerSelected(prevMarker, false);
    }

    selectedIdRef.current = item.id;
    setSelected(item);

    const marker = markersMap.current.get(item.id);
    if (marker) {
      animateMarkerTap(marker);
      setChegirmaMarkerSelected(marker, true);
      mapInstance.current?.panTo([item.latitude, item.longitude], { animate: true });
    }
  }, []);

  const handleCloseCard = useCallback(() => {
    if (selectedIdRef.current) {
      const marker = markersMap.current.get(selectedIdRef.current);
      if (marker) setChegirmaMarkerSelected(marker, false);
    }
    selectedIdRef.current = null;
    setSelected(null);
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
    itemsMap.current.clear();
    selectedIdRef.current = null;
    setSelected(null);

    for (const item of items) {
      const marker = L.marker([item.latitude, item.longitude], {
        icon: createChegirmaCircleIcon(false),
      });
      marker.on("click", () => handleSelect(item));
      clusterGroup.current.addLayer(marker);
      markersMap.current.set(item.id, marker);
      itemsMap.current.set(item.id, item);
    }
  }, [items, handleSelect]);

  return (
    <div className="relative h-[calc(100dvh-var(--header-height)-var(--nav-height)-7rem)] md:h-[calc(100vh-12rem)]">
      <div className="absolute left-0 right-0 top-0 z-[500] bg-white/90 pt-2 pb-2 backdrop-blur-md">
        <FilterChips
          chips={categoryChips}
          active={category}
          onChange={onCategoryChange}
        />
      </div>

      <div ref={mapRef} className="h-full w-full" />
      <ChegirmaMapCard item={selected} onClose={handleCloseCard} />
    </div>
  );
}
