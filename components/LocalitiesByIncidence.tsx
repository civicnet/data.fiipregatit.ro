import { Box, Grid, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/system";
import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import { LocalityWithFeatureAndHospitals } from "../types/Locality";
import LocalitySummaryWidget from "./LocalitySummaryWidget";
import SkeletonCard from "./SkeletonCard";

type Props = {
  low: number;
  high: number;
  style?: CSSProperties;
};

export default function LocalitiesByIncidence({ low, high, ...rest }: Props) {
  const [localities, setLocalities] = useState<
    LocalityWithFeatureAndHospitals[]
  >([]);

  const theme = useTheme();
  const downMid = useMediaQuery(theme.breakpoints.down("md"));

  const limit = downMid ? 2 : 3;

  const fetchData = useCallback(async () => {
    const response = await fetch(
      `/api/byIncidence?low=${low}&high=${high}&limit=${limit}`
    );
    const json = await response.json();
    setLocalities(json);
  }, [localities, high, low, limit]);

  useEffect(() => {
    fetchData();
  }, [high, low, limit]);

  if (!localities.length) {
    return (
      <Box sx={{ flexGrow: 1 }} {...rest}>
        <Grid container spacing={2}>
          {Array(limit)
            .fill(1)
            .map((_d, idx) => {
              return (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-card-${idx}`}>
                  <SkeletonCard />
                </Grid>
              );
            })}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }} {...rest}>
      <Grid container spacing={2}>
        {localities.map((l) => (
          <Grid item xs={12} sm={6} md={4} key={l.siruta}>
            <LocalitySummaryWidget locality={l} style={{ margin: "0 auto" }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
