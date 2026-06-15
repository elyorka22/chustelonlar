"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "@/styles/map-markers.css";
import { MAP_CENTER, MAP_ZOOM } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { findCategory } from "@/lib/category-helpers";
import {
  createClusterGroupOptions,
  createSingleCircleIcon,
  createPlacementIcon,
  animateMarkerTap,
  setMarkerSelected,
} from "@/lib/map-markers";
import type { CategoryData, MapAdMarker } from "@/types";

interface MapViewProps {
  ads: MapAdMarker[];
  categories?: CategoryData[];
  selectedId?: string | null;
  onSelectAd?: (id: string) => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  showSidebar?: boolean;
  height?: string;
}

export function MapView({
  ads,
  categories = [],
  selectedId,
  onSelectAd,
  category = "",
  onCategoryChange,
  showSidebar = true,
  height = "calc(100vh - 8rem)",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const clusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  const markersMap = useRef<Map<string, L.Marker>>(new Map());
  const prevSelectedRef = useRef<string | null>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [MAP_CENTER.lat, MAP_CENTER.lng],
      zoom: MAP_ZOOM,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const cluster = L.markerClusterGroup(createClusterGroupOptions());

    cluster.on("clusterclick", (e) => {
      animateMarkerTap(e.layer as unknown as L.Marker);
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

    for (const ad of ads) {
      const categoryInfo = findCategory(categories, ad.category);
      const icon = createSingleCircleIcon(false);
      const marker = L.marker([ad.latitude, ad.longitude], { icon });

      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          ${ad.thumbUrl ? `<img src="${ad.thumbUrl}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" />` : ""}
          <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: 600;">${ad.title}</h3>
          <p style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #2563EB;">${formatPrice(ad.price)}</p>
          <p style="margin: 0; font-size: 12px; color: #666;">${categoryInfo?.emoji || ""} ${ad.district}</p>
          <a href="/ads/${ad.id}" style="display: inline-block; margin-top: 8px; color: #2563EB; font-size: 13px; text-decoration: none; font-weight: 600;">Batafsil →</a>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });
      marker.on("click", () => {
        animateMarkerTap(marker);
        onSelectAd?.(ad.id);
      });

      clusterGroup.current.addLayer(marker);
      markersMap.current.set(ad.id, marker);
    }
  }, [ads, onSelectAd]);

  useEffect(() => {
    const prevId = prevSelectedRef.current;

    if (prevId && prevId !== selectedId) {
      const prevMarker = markersMap.current.get(prevId);
      if (prevMarker) {
        setMarkerSelected(prevMarker, false);
      }
    }

    if (selectedId) {
      const marker = markersMap.current.get(selectedId);
      if (marker) {
        setMarkerSelected(marker, true);
        const latlng = marker.getLatLng();
        mapInstance.current?.setView(latlng, 15, { animate: true });
        marker.openPopup();
      }
    }

    prevSelectedRef.current = selectedId ?? null;
  }, [selectedId]);

  const filteredAds = category
    ? ads.filter((a) => a.category === category)
    : ads;

  return (
    <div className="flex flex-col lg:flex-row" style={{ height }}>
      {showSidebar && (
        <div className="w-full overflow-y-auto border-r border-gray-200 bg-white lg:w-96">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
            <h2 className="font-semibold">Xaritadagi e&apos;lonlar</h2>
            <p className="text-sm text-gray-500">{filteredAds.length} ta e&apos;lon</p>
            {onCategoryChange && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onCategoryChange("")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    !category ? "bg-primary text-white" : "bg-secondary text-gray-600"
                  }`}
                >
                  Barchasi
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => onCategoryChange(cat.slug)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      category === cat.slug ? "bg-primary text-white" : "bg-secondary text-gray-600"
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {filteredAds.map((ad) => {
              const cat = findCategory(categories, ad.category);
              return (
                <button
                  key={ad.id}
                  onClick={() => onSelectAd?.(ad.id)}
                  className={`flex w-full gap-3 p-4 text-left transition-colors hover:bg-secondary/50 ${
                    selectedId === ad.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  {ad.thumbUrl ? (
                    <img
                      src={ad.thumbUrl}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-2xl">
                      {cat?.emoji}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">{ad.title}</h3>
                    <p className="text-sm font-bold text-primary">
                      {formatPrice(ad.price)}
                    </p>
                    <p className="text-xs text-gray-500">{ad.district}</p>
                  </div>
                </button>
              );
            })}
            {filteredAds.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                E&apos;lonlar topilmadi
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={mapRef} className="flex-1" />
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
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      maxZoom: 19,
    }).addTo(map);

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
      className={className || "h-48 w-full rounded-2xl overflow-hidden"}
    />
  );
}
