import {
  Box,
  Grid,
  Skeleton,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";
import SearchAppBar from "../../components/SearchAppBar";
import { Head } from "../../components/Head";
import SearchInput from "../../components/SearchInput";
import { SxProps } from "@mui/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoffee,
  faHandPaper,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import LocalitySummaryWidget from "../../components/LocalitySummaryWidget";
import { useRouter } from "next/dist/client/router";
import { LocalityWithFeature } from "../../types/Locality";
import { labelForLocality } from "../../lib/labelForLocality";
import Header from "../../components/Header";
import dynamic from "next/dynamic";
import { CovidMapLayers } from "../../components/CovidMap";
import turfCentroid from "@turf/centroid";
import { Feature, Point, Properties } from "@turf/helpers";

const DynamicCovidMap = dynamic(() => import("../../components/CovidMap"), {
  ssr: false,
  loading: () => <Skeleton height="100%" />,
});

const LocalityPage: NextPage = () => {
  const [locality, setLocality] = useState<LocalityWithFeature>();
  const [centroid, setCentroid] = useState<Feature<Point, Properties>>();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const router = useRouter();
  const { siruta } = router.query;

  const fetchLocality = useCallback(async () => {
    if (!siruta) {
      return;
    }

    const response = await fetch(`/api/bySiruta?code=${siruta}`);
    const json = await response.json() as LocalityWithFeature;
    setLocality(json);

    const centroidCoords = turfCentroid(json.features.uat);
    setCentroid(centroidCoords);
  }, [siruta]);

  useEffect(() => {
    fetchLocality();
  }, [siruta]);

  const headlineSx: SxProps<Theme> = {
    textTransform: "uppercase",
    textAlign: "center",
    fontSize: "2rem",
    mt: theme.spacing(6),
    mb: theme.spacing(8),
    "&:after": {
      content: `" "`,
      display: "block",
      borderBottom: `5px solid ${theme.palette.primary.main}`,
      width: "100px",
      margin: "25px auto 15px",
    },
  };

  return (
    <div>
      <Head />
      <Header />
      <main>
        <Grid container justifyContent="center">
          <Grid item xs={11} lg={6} xl={5}>
            {(locality &&centroid) && (
              <>
                <Typography variant="h1" sx={headlineSx}>
                  {labelForLocality(locality)}
                </Typography>
                <Grid container spacing={2} sx={{ margin: "0 auto" }}>
                  <Grid item xs={12} md={6}>
                    <LocalitySummaryWidget locality={locality} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                      <DynamicCovidMap
                        layers={[CovidMapLayers.UATS]}
                        county={locality.county}
                        siruta={locality.siruta}
                        viewState={{
                          latitude: centroid.geometry.coordinates[1] || 0, 
                          longitude: centroid.geometry.coordinates[0] || 0, 
                          zoom: 8.5,
                          pitch: 0,
                          bearing: 0,
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </main>
      <footer
        style={{
          background: "#4c4c4c",
          padding: theme.spacing(2),
          marginTop: theme.spacing(8),
        }}
      >
        <Grid container justifyContent="center">
          <Grid item>
            <Typography sx={{ color: "#bbb", fontSize: "12px" }}>
              Creat cu{" "}
              <Typography
                sx={{ "&:hover": { color: "#f00" } }}
                component="span"
              >
                <FontAwesomeIcon icon={faHeart} />
              </Typography>{" "}
              și <FontAwesomeIcon icon={faCoffee} /> de
            </Typography>
            <img src="/CivicNetLogoNegative.svg" style={{ width: "150px" }} />
            <Typography
              sx={{
                color: "#bbb",
                fontSize: "12px",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              <a
                href="https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=DE43VS64MPJB8&source=url"
                target="_blank"
              >
                <FontAwesomeIcon
                  icon={faHandPaper}
                  style={{ marginRight: theme.spacing(1) }}
                />
                Contribuie și tu
              </a>
            </Typography>
          </Grid>
        </Grid>
      </footer>
    </div>
  );
};

export default LocalityPage;
