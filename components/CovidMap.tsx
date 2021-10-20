/// app.js
import React, { useCallback, useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import chroma from "chroma-js";
import { Layers } from "../pages/api/layers";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faHeadSideCough,
  faMapPin,
  faSyringe,
} from "@fortawesome/free-solid-svg-icons";

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
  viewState?: typeof INITIAL_VIEW_STATE;
  layers?: CovidMapLayers[];
  county?: string,
  siruta?: string,
} 

export default function CovidMap({
  viewState = INITIAL_VIEW_STATE,
  layers = [CovidMapLayers.COUNTIES],
  county,
  siruta,
}: Props) {
  if (county && siruta) {
    throw new Error(`Can only specify county or UAT`);
  }

  const [layersData, setLayersData] = useState<Layers>();

  const [hoverInfo, setHoverInfo] =
    useState<HoverInfo<Layers["uats"][0] | Layers["counties"][0]>>();

  const fetchLayers = useCallback(async () => {
    let url = `/api/layers`;
    if (county) {
      url = `${url}?county=${county}`;  
    } else if (siruta) {
      url = `${url}?siruta=${siruta}`;
    }

    const data = await fetch(url);
    const response: Layers = await data.json();
    setLayersData(response);
  }, []);

  useEffect(() => {
    fetchLayers();
  }, []);

  if (!layersData) {
    return <Skeleton width="100%" height="100%" sx={{ transform: "unset" }} />;
  }

  const layersToRender: unknown[] = [
    new GeoJsonLayer({
      id: "uats-layer",
      data: layersData.uats,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthScale: 10,
      lineWidthMinPixels: 1,
      getFillColor: (d: typeof layersData.uats[0]) => {
        const hex = SeverityLevelColor[getSeverityLevel(d.properties.rate)];
        return chroma(hex).rgb();
      },
      getLineColor: () => [0, 0, 0, 128],
      getLineWidth: 1,
      visible: layers.includes(CovidMapLayers.UATS),
      onHover: (info: HoverInfo<Layers["uats"][0]>) => setHoverInfo(info),
    }),
    new GeoJsonLayer({
      id: "counties-layer",
      data: layersData.counties,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthScale: 10,
      lineWidthMinPixels: 1,
      getFillColor: (d: typeof layersData.counties[0]) => {
        const hex = SeverityLevelColor[getSeverityLevel(d.properties.rate)];
        return chroma(hex).rgb();
      },
      visible: layers.includes(CovidMapLayers.COUNTIES),
      getLineColor: () => [0, 0, 0, 128],
      getLineWidth: 1,
      onHover: (info: HoverInfo<Layers["counties"][0]>) => setHoverInfo(info),
    }),
  ];

  return (
    <DeckGL
      initialViewState={viewState}
      controller={true}
      layers={layersToRender}
    >
      <StaticMap
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/claudiuc/ck4rj1g758emo1do5slyr0i09"
      />
      {hoverInfo?.object && (
        <Card
          style={{
            position: "absolute",
            zIndex: 1,
            pointerEvents: "none",
            left: hoverInfo.x,
            top: hoverInfo.y,
          }}
        >
          <CardHeader
            avatar={
              <Avatar>
                <FontAwesomeIcon icon={faMapPin} />
              </Avatar>
            }
            title={hoverInfo.object.properties.name}
            subheader={
              "county" in hoverInfo.object.properties
                ? hoverInfo.object.properties.county
                : ""
            }
          />
          <CardContent>
            <List disablePadding dense>
              <ListItem alignItems="flex-start" disablePadding>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={faHeadSideCough} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Rata de infectare (incidența)"
                  secondary={`${hoverInfo.object.properties.rate.toFixed(2)}‰`}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem alignItems="flex-start" disablePadding>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={faSyringe} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Rata de vaccinare" secondary="35%" />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem alignItems="flex-start" disablePadding>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={faBed} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Paturi ATI disponibile" secondary={1} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}
    </DeckGL>
  );
}
