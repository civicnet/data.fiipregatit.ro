/// app.js
import React, { useCallback, useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { TextLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import chroma from "chroma-js";
import { Layers } from "../pages/api/layers";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faHeadSideCough,
  faMapPin,
  faSyringe,
  faTh,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import centroid from "@turf/centroid";
import { SeverityLevelDescription } from "../lib/SeverityLevelDescription";
import { SeverityLevel } from "../lib/SeverityLevel";
import CalendarPicker from "@mui/lab/CalendarPicker";
import { LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { ChevronLeft } from "@mui/icons-material";

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
  viewState?: Partial<typeof INITIAL_VIEW_STATE>;
  layer?: CovidMapLayers;
  county?: string;
  siruta?: string;
};

export default function CovidMap({
  viewState = INITIAL_VIEW_STATE,
  layer = CovidMapLayers.COUNTIES,
  county,
  siruta,
}: Props) {
  const [selectedLayer, setSelectedLayer] = useState(layer);
  const [layersData, setLayersData] = useState<Layers>();
  /* const [date, setDate] = useState<Date | null>(new Date());
  const [minDate, setMinDate] = useState();
  const [maxDate, setMaxDate] = useState<Date | null>(new Date()); */
  const [hoverInfo, setHoverInfo] =
    useState<HoverInfo<Layers["uats"][0] | Layers["counties"][0]>>();

  const theme = useTheme();
  const fetchLayers = useCallback(async () => {
    let url = `/api/layers`;
    if (county) {
      url = `${url}?county=${county}`;
    } else if (siruta && !county) {
      url = `${url}?siruta=${siruta}`;
    }

    const data = await fetch(url);
    const response: Layers = await data.json();
    setLayersData(response);
  }, [siruta, county]);

  useEffect(() => {
    fetchLayers();
  }, [siruta, county]);

  if (!layersData) {
    return <Skeleton width="100%" height="100%" sx={{ transform: "unset" }} />;
  }

  const selectLayer = (
    _e: React.MouseEvent<HTMLElement, MouseEvent>,
    layer: CovidMapLayers
  ) => {
    setSelectedLayer(layer);
  };

  const characters = "aăâbcdefghiîjklmnopqrsștțuvwxyz";
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
      getLineColor: (d: typeof layersData.uats[0]) => {
        let opacity = 64;
        const hoverProps = hoverInfo?.object?.properties;
        if (
          hoverProps &&
          "siruta" in hoverProps &&
          hoverProps.siruta === d.properties.siruta
        ) {
          opacity = 255;
        }

        return [33, 33, 33, opacity];
      },
      getLineWidth: 1,
      visible: selectedLayer === CovidMapLayers.UATS,
      onHover: (info: HoverInfo<Layers["uats"][0]>) => setHoverInfo(info),
      updateTriggers: {
        getLineColor: [hoverInfo, siruta],
      },
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
      visible: selectedLayer === CovidMapLayers.COUNTIES,
      getLineColor: () => [0, 0, 0, 128],
      getLineWidth: 1,
      onHover: (info: HoverInfo<Layers["counties"][0]>) => setHoverInfo(info),
    }),
    new TextLayer({
      id: "county-label-layer",
      data: layersData.counties,
      pickable: false,
      getPosition: (d: typeof layersData.uats[0]) => {
        const coords = centroid(d);
        return [coords.geometry.coordinates[0], coords.geometry.coordinates[1]];
      },
      getText: (d: typeof layersData.uats[0]) => d.properties.name,
      getSize: 14,
      getColor: [33, 33, 33, 255],
      getAngle: 0,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      visible: selectedLayer === CovidMapLayers.COUNTIES,
      fontFamily: "Roboto, sans-serif",
      characterSet: "auto", // `${characters}${characters.toUpperCase()} 123456890-`,,
    }),
    new TextLayer({
      id: "uat-label-layer",
      data: layersData.uats,
      pickable: false,
      getPosition: (d: typeof layersData.uats[0]) => {
        const coords = centroid(d);
        return [coords.geometry.coordinates[0], coords.geometry.coordinates[1]];
      },
      getText: (d: typeof layersData.uats[0]) => d.properties.name,
      getSize: 14,
      getColor: (d: typeof layersData.uats[0]) => {
        let opacity = 0;
        const hoverProps = hoverInfo?.object?.properties;
        if (
          hoverProps &&
          "siruta" in hoverProps &&
          hoverProps.siruta === d.properties.siruta
        ) {
          opacity = 255;
        }
        if (siruta && siruta === d.properties.siruta) {
          opacity = 255;
        }

        return [33, 33, 33, opacity];
      },
      getAngle: 0,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      visible: selectedLayer === CovidMapLayers.UATS && (county || siruta),
      fontFamily: "Roboto, sans-serif",
      characterSet: "auto", // `${characters}${characters.toUpperCase()} 123456890-`,
      updateTriggers: {
        getColor: [hoverInfo, siruta],
      },
    }),
    new TextLayer({
      id: "uat-rate-label-layer",
      data: layersData.uats,
      pickable: false,
      getPosition: (d: typeof layersData.uats[0]) => {
        const coords = centroid(d);
        return [coords.geometry.coordinates[0], coords.geometry.coordinates[1]];
      },
      getPixelOffset: [0, 20],
      getText: (d: typeof layersData.uats[0]) =>
        `${d.properties.rate.toFixed(2)}‰` || "",
      getSize: 14,
      getColor: (d: typeof layersData.uats[0]) => {
        let opacity = 0;
        const hoverProps = hoverInfo?.object?.properties;
        if (
          hoverProps &&
          "siruta" in hoverProps &&
          hoverProps.siruta === d.properties.siruta
        ) {
          opacity = 255;
        }

        return [33, 33, 33, opacity];
      },
      getAngle: 0,
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      visible: selectedLayer === CovidMapLayers.UATS && (county || siruta),
      fontFamily: "Roboto, sans-serif",
      characterSet: "auto", // `123456890.`,
      updateTriggers: {
        getColor: [hoverInfo, siruta],
      },
    }),
  ];

  return (
    <>
      <Paper
        sx={{
          p: 2,
          mb: 3,
          position: "absolute",
          top: theme.spacing(2),
          left: theme.spacing(2),
          zIndex: 10,
        }}
      >
        <List dense={true} disablePadding sx={{ mt: 0 }}>
          <ListItem>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: "bold" }}>Legendă</Typography>
              }
              secondary={`
                ${new Date(
                  layersData.lastUpdatedAt
                ).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              `}
            />
          </ListItem>
          <Divider />
          {Object.entries(SeverityLevelColor).map(([k, v]) => {
            return (
              <ListItem disablePadding>
                <ListItemAvatar
                  sx={{
                    minWidth: theme.spacing(3),
                  }}
                >
                  <Avatar
                    sx={{
                      background: v,
                      height: "1rem",
                      width: "1rem",
                    }}
                  >
                    {" "}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={SeverityLevelDescription[k as SeverityLevel]}
                />
              </ListItem>
            );
          })}
        </List>
        {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CalendarPicker
            date={date}
            onChange={(newDate) => setDate(newDate)}
          />
        </LocalizationProvider> */}
      </Paper>

      <Box
        sx={{
          p: 2,
          mb: 3,
          position: "absolute",
          top: theme.spacing(2),
          right: theme.spacing(2),
          zIndex: 10,
        }}
      >
        <ToggleButtonGroup
          value={selectedLayer}
          exclusive
          onChange={selectLayer}
          aria-label="text alignment"
          sx={{ background: "#fff" }}
        >
          <Tooltip title="Vezi localități">
            <ToggleButton
              value={CovidMapLayers.UATS}
              aria-label="left aligned"
              selected={selectedLayer === CovidMapLayers.UATS}
            >
              <FontAwesomeIcon icon={faTh} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Vezi județe">
            <ToggleButton
              value={CovidMapLayers.COUNTIES}
              aria-label="centered"
              selected={selectedLayer === CovidMapLayers.COUNTIES}
            >
              <FontAwesomeIcon icon={faThLarge} />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layersToRender}
      >
        <StaticMap
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/claudiuc/ck4rj1g758emo1do5slyr0i09"
        />
        {hoverInfo?.object && !(siruta || county) && (
          <Card
            style={{
              position: "absolute",
              zIndex: 1,
              pointerEvents: "none",
              left: hoverInfo.x,
              top: hoverInfo.y,
              width: 250,
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
                    secondary={`${hoverInfo.object.properties.rate.toFixed(
                      2
                    )}‰`}
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
                  <ListItemText
                    primary="Paturi ATI disponibile"
                    secondary={1}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}
      </DeckGL>
    </>
  );
}
