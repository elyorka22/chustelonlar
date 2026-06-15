import "leaflet.markercluster";

declare module "leaflet" {
  interface MarkerClusterGroupOptions {
    showCoverageOnHover?: boolean;
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    animate?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyDistanceMultiplier?: number;
    iconCreateFunction?: (cluster: MarkerClusterGroup) => L.DivIcon;
  }

  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: Layer): this;
    clearLayers(): this;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
