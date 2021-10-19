import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/system";
import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import { LocalityWithFeature } from "../types/Locality";
import LocalitySummaryWidget from "./LocalitySummaryWidget";

type Props = {
  low: number;
  high: number;
  style?: CSSProperties;
};

export default function LocalitiesByIncidence({ low, high, ...rest }: Props) {
  const [localities, setLocalities] = useState<LocalityWithFeature[]>([]);

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
    const skeletonCard = (
      <Card sx={{ maxWidth: 345, m: 2 }} style={{ margin: "0 auto" }}>
        <CardHeader
          avatar={
            <Skeleton
              animation="wave"
              variant="circular"
              width={40}
              height={40}
            />
          }
          title={
            <Skeleton
              animation="wave"
              height={10}
              width="80%"
              style={{ marginBottom: 6 }}
            />
          }
          subheader={<Skeleton animation="wave" height={10} width="40%" />}
        />
        {
          <Skeleton
            sx={{ height: 190 }}
            animation="wave"
            variant="rectangular"
          />
        }
        <CardContent>
          {
            <React.Fragment>
              <Skeleton
                animation="wave"
                height={10}
                style={{ marginBottom: 6 }}
              />
              <Skeleton animation="wave" height={10} width="80%" />
            </React.Fragment>
          }
        </CardContent>
      </Card>
    );

    return (
      <Box sx={{ flexGrow: 1 }} {...rest}>
        <Grid container spacing={2}>
          {Array(limit)
            .fill(1)
            .map((_d, idx) => {
              return (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-card-${idx}`}>
                  {skeletonCard}
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
