/// app.js
import React, { useCallback, useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import chroma from "chroma-js";
import { Layers } from "../pages/api/layers";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import { Skeleton } from "@mui/material";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 24.82,
  latitude: 45.9,
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
};

type HoverInfo<T extends Layers["counties"][0] | Layers["uats"][0]> = {
  object: T;
  x: number;
  y: number;
};

export enum CovidMapLayers {
  UATS = "UATS",
  COUNTIES = "COUNTIES",
  LABELS = "LABELS",
}

type Props = {
  view?: typeof INITIAL_VIEW_STATE;
  layers?: CovidMapLayers[];
};

export default function CovidMap({
  view = INITIAL_VIEW_STATE,
  layers = [CovidMapLayers.COUNTIES],
}: Props) {
  const [layersData, setLayersData] = useState<Layers>();
  const [hoverInfo, setHoverInfo] = useState<HoverInfo<Layers["uats"][0]>>();

  const fetchLayers = useCallback(async () => {
    const data = await fetch(`/api/layers`);
    const response: Layers = await data.json();
    setLayersData(response);
  }, []);

  useEffect(() => {
    fetchLayers();
  }, []);

  if (!layersData) {
    return <Skeleton width="100%" height="100%" sx={{ transform: "unset" }} />;
  }

  const domain = chroma
    .scale(Object.values(SeverityLevelColor))
    .domain(layersData ? layersData.countyRange : [0, 0]);

  const layersToRender: unknown[] = [
    layers.includes(CovidMapLayers.UATS) && new GeoJsonLayer({
      id: "uats-layer",
      data: layersData.uats,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthScale: 5,
      lineWidthMinPixels: 1,
      getFillColor: (d: typeof layersData.uats[0]) => {
        const hex = SeverityLevelColor[getSeverityLevel(d.properties.rate)];
        return chroma(hex).rgb();
      },
      getLineColor: () => {
        const opacity = layers.includes(CovidMapLayers.COUNTIES) ? 64 : 128;
        return [0, 0, 0, opacity];
      },
      getLineWidth: 1,
      onHover: (info: HoverInfo<Layers["uats"][0]>) => setHoverInfo(info),
    }),
    layers.includes(CovidMapLayers.COUNTIES) && new GeoJsonLayer({
      id: "counties-layer",
      data: layersData.counties,
      pickable: true,
      stroked: true,
      filled: !layers.includes(CovidMapLayers.UATS),
      extruded: false,
      lineWidthScale: 10,
      lineWidthMinPixels: 2,
      getFillColor: (d: typeof layersData.counties[0]) => {
        const hex = SeverityLevelColor[getSeverityLevel(d.properties.rate)];
        return chroma(hex).rgb();
      },
      getLineColor: () => [0, 0, 0, 128],
      getLineWidth: 1,
    }),
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layersToRender}
    >
      <StaticMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/claudiuc/ck4rj1g758emo1do5slyr0i09"
      />
      {hoverInfo?.object && (
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            pointerEvents: "none",
            left: hoverInfo.x,
            top: hoverInfo.y,
            background: "#fff",
            padding: 16,
          }}
        >
          <p>
            <strong>{hoverInfo.object.properties.name}</strong>
          </p>
          <p>{hoverInfo.object.properties.rate}</p>
        </div>
      )}
    </DeckGL>
  );
}
