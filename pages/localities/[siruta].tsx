import { Box, Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import React, { useCallback, useEffect, useState } from "react";
import { Head } from "../../components/Head";
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
import { fetchLocalityBySiruta } from "../../server/fetchLocalityBySiruta";

const DynamicCovidMap = dynamic(() => import("../../components/CovidMap"), {
  ssr: false,
  loading: () => <Skeleton height="100%" />,
});

const LocalityPage: NextPage = ({
  locality,
  coords,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>
      <Head />
      <Header />
      <main style={{ marginBottom: theme.spacing(8) }}>
        {locality && coords && (
          <Headline>{labelForLocality(locality)}</Headline>
        )}
        <Grid container spacing={2} justifyContent="center">
          {locality && coords && (
            <>
              <Grid item xs={11} md={5}>
                <LocalitySummaryWidget locality={locality} />
              </Grid>
              <Grid item xs={11} md={6}>
                <Box
                  sx={{
                    width: "100%",
                    height: matches ? "300px" : "100%",
                    position: "relative",
                  }}
                >
                  <DynamicCovidMap
                    layer={CovidMapLayers.UATS}
                    county={locality.county}
                    siruta={locality.siruta}
                    viewState={{
                      latitude: coords.geometry.coordinates[1] || 0,
                      longitude: coords.geometry.coordinates[0] || 0,
                      zoom: 8.5,
                      pitch: 0,
                      bearing: 0,
                    }}
                  />
                </Box>
              </Grid>
            </>
          )}
          <Grid item xs={11}>
            <Headline>Localități marcate</Headline>
            <TrackedLocalitiesCTA />
          </Grid>
        </Grid>
      </main>
      <Footer />
    </div>
  );
};

export default LocalityPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const siruta = context.params?.siruta;

  if (!siruta || typeof siruta !== "string") {
    return {
      notFound: true,
    };
  }

  const match = await fetchLocalityBySiruta(siruta);
  const centroid = turfCentroid(match.features.uat);
  return {
    props: {
      locality: match,
      coords: centroid,
    },
  };
};
