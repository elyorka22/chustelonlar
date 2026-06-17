import L from "leaflet";

export type ClusterSize = "small" | "medium" | "large";

/** Единый голубой цвет для всех маркеров */
const MARKER_BLUE = {
  outer: "rgba(59, 130, 246, 0.25)",
  inner: "#2563EB",
  gradient: "linear-gradient(135deg, #3B82F6, #2563EB)",
};

function circleBox(size: number): string {
  return [
    `width:${size}px`,
    `height:${size}px`,
    `min-width:${size}px`,
    `min-height:${size}px`,
    "border-radius:9999px",
    "box-sizing:border-box",
    "flex-shrink:0",
  ].join(";") + ";";
}

export function getClusterSize(count: number): ClusterSize {
  if (count >= 50) return "large";
  if (count >= 10) return "medium";
  return "small";
}

export function getClusterDimension(size: ClusterSize): number {
  if (size === "large") return 64;
  if (size === "medium") return 50;
  return 40;
}

export function createClusterIcon(count: number): L.DivIcon {
  const sizeKey = getClusterSize(count);
  const d = getClusterDimension(sizeKey);
  const fontSize = sizeKey === "large" ? 18 : sizeKey === "medium" ? 16 : 14;

  const html = `<div class="chust-cluster-circle" style="${circleBox(d)}display:flex;align-items:center;justify-content:center;background:${MARKER_BLUE.gradient};color:#fff;font-weight:700;font-size:${fontSize}px;line-height:1;box-shadow:0 8px 24px rgba(37,99,235,.35);cursor:pointer;font-family:system-ui,sans-serif;">${count}</div>`;

  return L.divIcon({
    html,
    className: "chust-cluster-marker",
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
  });
}

/** Оранжевый цвет для маркеров акций */
const CHEGIRMA_ORANGE = {
  outer: "rgba(249, 115, 22, 0.25)",
  inner: "#EA580C",
  gradient: "linear-gradient(135deg, #FB923C, #EA580C)",
};

export function createChegirmaCircleIcon(selected = false): L.DivIcon {
  const size = selected ? 32 : 24;
  const innerSize = selected ? 14 : 12;
  const shadow = selected ? "box-shadow:0 4px 16px rgba(234,88,12,.4);" : "";

  const html = `<div class="chust-single-circle${selected ? " chust-single-circle--selected" : ""}" style="${circleBox(size)}display:flex;align-items:center;justify-content:center;background:${CHEGIRMA_ORANGE.outer};${shadow}cursor:pointer;">
    <div class="chust-inner-circle" style="${circleBox(innerSize)}background:${CHEGIRMA_ORANGE.inner};"></div>
  </div>`;

  return L.divIcon({
    html,
    className: "chust-single-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function setChegirmaMarkerSelected(marker: L.Marker, selected: boolean): void {
  marker.setIcon(createChegirmaCircleIcon(selected));
}

export function createSingleCircleIcon(selected = false): L.DivIcon {
  const size = selected ? 32 : 24;
  const innerSize = selected ? 14 : 12;
  const shadow = selected ? "box-shadow:0 4px 16px rgba(37,99,235,.4);" : "";

  const html = `<div class="chust-single-circle${selected ? " chust-single-circle--selected" : ""}" style="${circleBox(size)}display:flex;align-items:center;justify-content:center;background:${MARKER_BLUE.outer};${shadow}cursor:pointer;">
    <div class="chust-inner-circle" style="${circleBox(innerSize)}background:${MARKER_BLUE.inner};"></div>
  </div>`;

  return L.divIcon({
    html,
    className: "chust-single-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createPlacementIcon(): L.DivIcon {
  return createSingleCircleIcon(true);
}

export function createClusterGroupOptions(): L.MarkerClusterGroupOptions {
  return {
    showCoverageOnHover: false,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    animate: true,
    zoomToBoundsOnClick: true,
    spiderfyDistanceMultiplier: 1.5,
    iconCreateFunction: (cluster) => {
      return createClusterIcon(cluster.getChildCount());
    },
  };
}

export function animateMarkerTap(marker: L.Marker): void {
  const el = marker.getElement();
  if (!el) return;
  const circle = el.querySelector(".chust-single-circle, .chust-cluster-circle");
  if (circle) {
    circle.classList.add("chust-marker-tap");
    window.setTimeout(() => circle.classList.remove("chust-marker-tap"), 300);
  }
}

export function setMarkerSelected(
  marker: L.Marker,
  selected: boolean
): void {
  marker.setIcon(createSingleCircleIcon(selected));
}
