import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { TextLayer } from "@deck.gl/layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";
import chroma from "chroma-js";
import { Layers } from "../pages/api/layers";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import {
  Box,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHospitalSymbol,
  faTh,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import centroid from "@turf/centroid";
import { SeverityLevel } from "../lib/SeverityLevel";
import { Hospital } from "../pages/api/hospitals";
import { getNewestData } from "../lib/getNewestData";
import FeatureMapHovercard from "./FeatureMapHovercard";
import HospitalMapHovercard from "./HospitalMapHovercard";
import FeatureMapLegend from "./FeatureMapLegend";
import HospitalsMapLegend from "./HospitalsMapLegend";
import { getNewestNonStaleData } from "../lib/getNewestNonStaleData";

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: 24.82,
  latitude: 45.9,
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
};

export enum CovidMapLayers {
  UATS = "UATS",
  COUNTIES = "COUNTIES",
  LABELS = "LABELS",
  HOSPITALS = "HOSPITALS",
}

export type HoverInfoCounty = Layers["counties"][0];
export type HoverInfoUAT = Layers["uats"][0];
export type HoverInfoObject = HoverInfoCounty | HoverInfoUAT | Hospital;

export type HoverInfo<T extends HoverInfoObject = HoverInfoObject> = {
  object: T;
};

type Props = {
  viewState?: Partial<typeof INITIAL_VIEW_STATE>;
  layer?: CovidMapLayers;
  county?: string;
  siruta?: string;
};

export default function CovidMap({
  viewState = INITIAL_VIEW_STATE,
  layer = CovidMapLayers.HOSPITALS,
  county,
  siruta,
}: Props) {
  const [selectedLayer, setSelectedLayer] = useState(layer);
  const [layersData, setLayersData] = useState<Layers>();
  const [hospitals, setHospitalData] = useState<Hospital[]>();
  const [icuRange, setICURange] = useState<[number, number]>();
  const [filteredHospitals, setFilteredHospitals] = useState(
    Object.keys(SeverityLevel)
  );
  const [hoverInfo, setHoverInfo] = useState<HoverInfo<HoverInfoObject>>();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  if (matches) {
    INITIAL_VIEW_STATE.zoom = 5;
    INITIAL_VIEW_STATE.latitude = 47;
  }

  const mapRef = useRef<Element>(null);

  const fetchLayers = useCallback(async () => {
    let urlParams = "";
    if (county) {
      urlParams = `?county=${county}`;
    } else if (siruta && !county) {
      urlParams = `?siruta=${siruta}`;
    }

    const [fetchedLayersData, hospitalData] = await Promise.all([
      fetch(`/api/layers${urlParams}`),
      fetch(`/api/hospitals${urlParams}`),
    ]);

    const [layersDataResponse, hospitalDataResponse] = await Promise.all([
      fetchedLayersData.json(),
      hospitalData.json(),
    ]);

    setLayersData(layersDataResponse);
    setHospitalData(hospitalDataResponse.hospitals);

    const { minICU, maxICU } = hospitalDataResponse.statistics;
    setICURange([minICU, maxICU]);
  }, [siruta, county]);

  useEffect(() => {
    fetchLayers();
  }, [siruta, county]);

  if (!layersData || !hospitals) {
    return <Skeleton width="100%" height="100%" sx={{ transform: "unset" }} />;
  }

  const selectLayer = (
    _e: React.MouseEvent<HTMLElement, MouseEvent>,
    layer: CovidMapLayers
  ) => {
    setSelectedLayer(layer);
  };

  const filterHospitals = (severity: SeverityLevel) => {
    if (filteredHospitals.includes(severity)) {
      setFilteredHospitals(filteredHospitals.filter((s) => s !== severity));
    } else {
      setFilteredHospitals([...filteredHospitals, severity]);
    }
  };
  const limits = chroma.limits(
    hospitals.map((h) => Number(getNewestData(h.data.icu))),
    "e",
    4
  );

  const mappedLimits = limits.reduce(
    (acc, n, idx) => {
      const currentKey = Object.keys(SeverityLevel)[idx] as SeverityLevel;
      const previousKey = Object.keys(SeverityLevel)[idx - 1];

      let previousCeiling = 0;
      if (previousKey in acc) {
        previousCeiling = acc[previousKey as keyof typeof acc][1];
      }

      return {
        ...acc,
        [SeverityLevel[currentKey]]: [previousCeiling, n],
      };
    },
    { [SeverityLevel.NONE]: [0, 0] } as Record<SeverityLevel, [number, number]>
  );

  const getCountForHospital = (d: Hospital): number => {
    const latestICUCount = getNewestNonStaleData(d.data.icu) || [, 0];
    const latestInpatientsCount = getNewestNonStaleData(d.data.inpatient) || [
      ,
      0,
    ];

    return latestICUCount[1] + latestInpatientsCount[1];
  };

  const severityForHospital = (d: Hospital): SeverityLevel => {
    let sev = SeverityLevel.NONE;

    if (getCountForHospital(d) === 0) {
      sev = SeverityLevel.NONE;
    }

    const count = getNewestNonStaleData(d.data.icu) || [, 0];
    for (const [k, [low, high]] of Object.entries(mappedLimits)) {
      if (count[1] >= low && count[1] <= high) {
        sev = k as SeverityLevel;
        break;
      }
    }

    return sev;
  };

  const getScatterplotColor = (opacity: number) => (d: Hospital) => {
    const last = getNewestData(d.data.icu);
    if (typeof last !== "number") {
      return [128, 128, 128, opacity];
    }

    const sev = severityForHospital(d);
    if (filteredHospitals.includes(sev)) {
      return [...chroma(SeverityLevelColor.scatterplot[sev]).rgb(), opacity];
    }

    return [0, 0, 0, 0];
  };

  const setProjectedHoverInfo = (info?: HoverInfo<HoverInfoObject>): void => {
    setHoverInfo(info);
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
        const hex =
          SeverityLevelColor.geojson[getSeverityLevel(d.properties.rate)];
        return chroma(hex).rgb();
      },
      getLineColor: (d: typeof layersData.uats[0]) => {
        let opacity = 64;
        /* const obj = hoverInfo?.object;
        if (
          obj &&
          "properties" in obj &&
          "siruta" in obj.properties &&
          obj.properties.siruta === d.properties.siruta
        ) {
          opacity = 255;
        } */

        return [33, 33, 33, opacity];
      },
      getLineWidth: 1,
      visible: selectedLayer === CovidMapLayers.UATS,
      onHover: (info: HoverInfo<Layers["uats"][0]>) =>
        setProjectedHoverInfo(info),
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
        const hex =
          SeverityLevelColor.geojson[getSeverityLevel(d.properties.rate)];
        return chroma(hex).rgb();
      },
      visible: selectedLayer === CovidMapLayers.COUNTIES,
      getLineColor: () => [0, 0, 0, 128],
      getLineWidth: 1,
      onHover: (info: HoverInfo<Layers["counties"][0]>) =>
        setProjectedHoverInfo(info),
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
        const obj = hoverInfo?.object;
        if (
          obj &&
          "properties" in obj &&
          "siruta" in obj.properties &&
          obj.properties.siruta === d.properties.siruta
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
        const obj = hoverInfo?.object;
        if (
          obj &&
          "properties" in obj &&
          "siruta" in obj.properties &&
          obj.properties.siruta === d.properties.siruta
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
    new ScatterplotLayer({
      id: "hospitals-icu-scatterplot-layer",
      data: hospitals.filter((h) =>
        filteredHospitals.includes(severityForHospital(h))
      ),
      pickable: true,
      opacity: 1,
      stroked: true,
      filled: true,
      radiusScale: 30,
      radiusMinPixels: 4,
      radiusMaxPixels: 60,
      getPosition: (d: Hospital) => {
        return [d.coordinates.lng, d.coordinates.lat];
      },
      getRadius: getCountForHospital,
      getFillColor: getScatterplotColor(128),
      getLineColor: getScatterplotColor(255),
      lineWidthMinPixels: 2,
      visible: selectedLayer === CovidMapLayers.HOSPITALS,
      onHover: (info: HoverInfo<Hospital>) => setProjectedHoverInfo(info),
    }),
  ];

  return (
    <Box ref={mapRef} sx={{ width: "100%", height: "100%" }}>
      <Box
        sx={{
          position: "absolute",
          top: theme.spacing(2),
          left: theme.spacing(2),
          zIndex: 10,
        }}
      >
        {selectedLayer !== CovidMapLayers.HOSPITALS && (
          <FeatureMapLegend lastUpdatedAt={layersData.lastUpdatedAt} />
        )}
        {selectedLayer === CovidMapLayers.HOSPITALS && (
          <HospitalsMapLegend
            lastUpdatedAt={layersData.lastUpdatedAt}
            limits={mappedLimits}
            onFiltered={filterHospitals}
            filtered={filteredHospitals as SeverityLevel[]}
          />
        )}

        <Box sx={{ mt: 2 }}>
          {hoverInfo?.object && "coordinates" in hoverInfo?.object && (
            <HospitalMapHovercard object={hoverInfo?.object} />
          )}
          {hoverInfo?.object && !("coordinates" in hoverInfo?.object) && (
            <FeatureMapHovercard object={hoverInfo?.object} />
          )}
        </Box>
      </Box>

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
          <Tooltip title="Vezi spitale (în funcție de paturi ATI ocupate)">
            <ToggleButton
              value={CovidMapLayers.HOSPITALS}
              aria-label="centered"
              selected={selectedLayer === CovidMapLayers.HOSPITALS}
            >
              <FontAwesomeIcon icon={faHospitalSymbol} />
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
          mapStyle={
            selectedLayer === CovidMapLayers.HOSPITALS
              ? "mapbox://styles/claudiuc/ckv1j1ucy032w15qq3fmcuyyo"
              : "mapbox://styles/claudiuc/ck4rj1g758emo1do5slyr0i09"
          }
        />
      </DeckGL>
    </Box>
  );
}
