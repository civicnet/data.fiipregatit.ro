import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import React, { useCallback, useEffect, useState } from "react";
import { Head } from "../../components/Head";
import LocalitySummaryWidget from "../../components/LocalitySummaryWidget";
import { useRouter } from "next/dist/client/router";
import {
  LocalityWithFeature,
  LocalityWithFeatureAndHospitals,
} from "../../types/Locality";
import { labelForLocality } from "../../lib/labelForLocality";
import Header from "../../components/Header";
import dynamic from "next/dynamic";
import { CovidMapLayers } from "../../components/CovidMap";
import turfCentroid from "@turf/centroid";
import { Feature, Point, Position, Properties } from "@turf/helpers";
import TrackedLocalitiesCTA from "../../components/TrackedLocalitiesCTA";
import Headline from "../../components/Headline";
import Footer from "../../components/Footer";
import { fetchLocalityBySiruta } from "../../server/fetchLocalityBySiruta";
import { getNewestNonStaleData } from "../../lib/getNewestNonStaleData";
import path from "path";
import fs from "fs";
import matter from "gray-matter";
import MarkdownContent from "../../components/MarkdownContent";
import { ExpandMore } from "@mui/icons-material";
import classes from "./siruta.module.css";

const fsp = fs.promises;

const DynamicCovidMap = dynamic(() => import("../../components/CovidMap"), {
  ssr: false,
  loading: () => <Skeleton height="100%" />,
});

const LocalityPage: NextPage = ({
  locality,
  coords,
  content,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div>
      <Head title={`${locality.uat} | data.fiipregătit.ro`} />
      <Header />
      <main>
        <Grid container justifyContent="center">
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
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
            </Grid>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" sx={{ background: "#efefef", mt: theme.spacing(6), pb: theme.spacing(6)}}>
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
            <Headline>Restricții</Headline>
            {(content as ServerSideContent[]).map((c, idx) => {
              return (
                <Accordion key={`accordion-${idx}`}>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls={`panel1a-content-${idx}`}
                    classes={{
                      expanded: classes.accordionSummaryExpanded,
                      root: classes.accordionSummaryRoot,
                      content: classes.accordionSummaryContent,
                    }}
                  >
                    <Typography variant="h6">{c.data.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <MarkdownContent>{c.content}</MarkdownContent>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Grid>
        </Grid>
        <Grid container justifyContent="center" sx={{ pb: theme.spacing(6)}}>
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
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

type ServerSideContent = {
  data: {
    title: string;
    low: number;
    high: number;
  };
  content: string;
};

type ServerSideProps =
  | {
      props: {
        locality: LocalityWithFeatureAndHospitals;
        coords: Feature<Point, Properties>;
        content: ServerSideContent[];
      };
    }
  | {
      notFound: true;
    };

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<ServerSideProps> => {
  const siruta = context.params?.siruta;

  if (!siruta || typeof siruta !== "string") {
    return {
      notFound: true,
    };
  }

  const match = await fetchLocalityBySiruta(siruta);
  const centroid = turfCentroid(match.features.uat);

  const rate = getNewestNonStaleData(match.data);

  const contentPath = path.join(process.cwd(), "content", "restrictions");

  const files = await fsp.readdir(contentPath);
  const content = await Promise.all(
    files.map(async (name) => {
      const fileContent = await fsp.readFile(
        path.join(contentPath, name),
        "utf8"
      );
      const { data, content } = matter(fileContent);

      if (!rate) {
        if (data.low === 0 && data.high === 1000) {
          return { data, content };
        }

        return;
      }

      if (data.low <= rate[1] && data.high >= rate[1]) {
        return { data, content };
      }
    })
  );

  return {
    props: {
      locality: match,
      coords: centroid,
      content: content.filter((c) => c !== undefined) as ServerSideContent[],
    },
  };
};
