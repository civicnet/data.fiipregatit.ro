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
import { Head } from "../components/Head";
import { useRouter } from "next/dist/client/router";
import { LocalityWithFeature } from "../types/Locality";
import Header from "../components/Header";
import dynamic from "next/dynamic";
import { CovidMapLayers } from "../components/CovidMap";
import turfCentroid from "@turf/centroid";
import { Feature, Point, Properties } from "@turf/helpers";
import Footer from "../components/Footer";

const DynamicCovidMap = dynamic(() => import("../components/CovidMap"), {
  ssr: false,
  loading: () => <Skeleton height="100%" />,
});

const MapPage: NextPage = () => {
  const theme = useTheme();

  const router = useRouter();
  const { siruta } = router.query;

  return (
    <div>
      <Head />
      <Header />
      <main>
        <Box sx={{ width: "100%", position: "relative", height: `calc(100vh - 375px)` }}>
          <DynamicCovidMap layer={CovidMapLayers.UATS} />
        </Box>
      </main>
      <Footer />
    </div>
  );
};

export default MapPage;
