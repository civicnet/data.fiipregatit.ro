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
import TrackedLocalitiesCTA from "../../components/TrackedLocalitiesCTA";
import Headline from "../../components/Headline";
import Footer from "../../components/Footer";

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

  return (
    <div>
      <Head />
      <Header />
      <main style={{ marginBottom: theme.spacing(8) }}>
        <Grid container justifyContent="center">
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
            {(locality &&centroid) && (
              <>
                <Headline>
                  {labelForLocality(locality)}
                </Headline>
                <Grid container spacing={2} sx={{ margin: "0 auto" }}>
                  <Grid item xs={12} md={6}>
                    <LocalitySummaryWidget locality={locality} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                      <DynamicCovidMap
                        layer={CovidMapLayers.UATS}
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
            <TrackedLocalitiesCTA />
          </Grid>
        </Grid>
      </main>
      <Footer />
    </div>
  );
};

export default LocalityPage;
