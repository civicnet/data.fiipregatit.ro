import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import React from "react";
import { Head } from "../../components/Head";
import LocalitySummaryWidget from "../../components/LocalitySummaryWidget";
import { LocalityWithFeatureAndHospitals } from "../../types/Locality";
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
import { getNewestNonStaleData } from "../../lib/getNewestNonStaleData";
import path from "path";
import fs from "fs";
import matter from "gray-matter";
import MarkdownContent from "../../components/MarkdownContent";
import { ExpandMore } from "@mui/icons-material";
import classes from "./siruta.module.css";
import { useRouter } from "next/router";

const fsp = fs.promises;

const DynamicCovidMap = dynamic(() => import("../../components/CovidMap"), {
  loading: () => <Skeleton height="100%" />,
});

const LocalityPage: NextPage = ({
  locality,
  coords,
  content,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const theme = useTheme();
  const router = useRouter();
  const matches = useMediaQuery(theme.breakpoints.down("md"));

  if (router.isFallback) {
    return (
      <div>
        <Head title={`... | data.fiipregătit.ro`} />
        <Header />
        <main>
          <Grid container justifyContent="center">
            <CircularProgress sx={{ mt: 6 }} />
          </Grid>
        </main>
      </div>
    );
  }

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
            <Grid container justifyContent="space-between" spacing={2}>
              <Grid item xs={12} md={4}>
                <LocalitySummaryWidget locality={locality} />
              </Grid>

              <Grid item xs={12} md={8}>
                {(content as ServerSideContent[]).map((c, idx) => {
                  return (
                    <Accordion key={`accordion-${idx}`} variant="outlined">
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
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent="center"
          sx={{
            background: "#efefef",
            mt: theme.spacing(6),
            pb: theme.spacing(6),
          }}
        >
          <Grid item xs={12} sm={10} md={9} lg={8} xl={6}>
            <Headline>Hartă</Headline>
            <Grid container spacing={2} justifyContent="center">
              {locality && coords && (
                <>
                  <Grid item xs={12} md={12}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "400px",
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
        <Grid container justifyContent="center" sx={{ pb: theme.spacing(6) }}>
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
      revalidate: number;
    }
  | {
      notFound: true;
    };

export const getStaticProps: GetStaticProps = async ({
  /* req,
  res, */
  params,
}): Promise<ServerSideProps> => {
  /* res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=7200"
  ); */

  const siruta = params?.siruta;
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
    revalidate: 60 * 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const localities = await import("../../data/octombrie.json");
  const paths = localities.default.map((l) => ({ params: { siruta: l.siruta } }));

  return { paths, fallback: "blocking" };
};
