import {
  Box,
  Skeleton,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import React from "react";
import { Head } from "../components/Head";
import { useRouter } from "next/dist/client/router";
import Header from "../components/Header";
import dynamic from "next/dynamic";
import { CovidMapLayers } from "../components/CovidMap";
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
          <DynamicCovidMap layer={CovidMapLayers.HOSPITALS} />
        </Box>
      </main>
      <Footer />
    </div>
  );
};

export default MapPage;
