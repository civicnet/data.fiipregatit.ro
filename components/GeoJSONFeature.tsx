import React, { useCallback, useEffect, useState } from "react";
import { scaleQuantize } from "@visx/scale";
import { Mercator, Graticule } from "@visx/geo";
import { ParentSize } from "@visx/responsive";
import centroid from "@turf/centroid";
import union from "@turf/union";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { Locality } from "../types/Locality";
import { COUNTIES_URL, UATS_URL } from "../lib/constants";
import {
  Feature,
  featureCollection,
  MultiPolygon,
  Polygon,
} from "@turf/helpers";
import dissolve from "@turf/dissolve";
import { GeoPermissibleObjects } from "@visx/geo/lib/types";

type FeatureProps = {
  feature: Feature;
  background?: string;
  stroke?: string;
  definesExtent?: boolean;
};

type Props = {
  features: FeatureProps[];
  background?: string;
};

export default function GeoJSONFeature({ features, background }: Props) {
  const theme = useTheme();

  if (!features.length) {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const definesExtent = features.find((f) => f.definesExtent);
  if (!definesExtent) {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ParentSize>
      {(parent) => (
        <svg width={parent.width} height={parent.height}>
          <rect
            x={0}
            y={0}
            width={parent.width}
            height={parent.height}
            fill={background || theme.palette.secondary.light}
          />
          <Mercator
            data={features.map((f) => f.feature) as GeoPermissibleObjects[]}
            fitExtent={[
              [
                [16, 16],
                [parent.width - 16, parent.height - 16],
              ],
              definesExtent.feature as any,
            ]}
          >
            {(mercator) => (
              <g>
                <Graticule
                  graticule={(g) => mercator.path(g) || ""}
                  stroke="rgba(33,33,33,0.05)"
                  step={[0.2, 0.2]}
                />
                {mercator.features.map(({ feature, path }, i) => {
                  const candidate = features.find(
                    (f) => {
                      const needle = "properties" in feature 
                        ? feature.properties?.natcode
                        : undefined;

                      if (!candidate || !needle) {
                        return false;
                      }

                      return f.feature.properties?.natcode ===
                      needle
                    });

                  return (
                    <path
                      key={`map-feature-${i}`}
                      d={path || ""}
                      fill={candidate?.background}
                      stroke={candidate?.stroke}
                      strokeWidth={1}
                    />
                  );
                })}
              </g>
            )}
          </Mercator>
          ;
        </svg>
      )}
    </ParentSize>
  );
}
