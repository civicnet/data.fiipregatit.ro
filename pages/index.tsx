import { Box, Button, Grid, Skeleton, Theme, useTheme } from "@mui/material";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import React from "react";
import styles from "../styles/Home.module.css";
import { Head } from "../components/Head";
import { SxProps } from "@mui/system";
import dynamic from "next/dynamic";
import { CovidMapLayers } from "../components/CovidMap";
import {
  AirlineSeatFlatOutlined,
  ArrowRight,
  CoronavirusOutlined,
  HealthAndSafetyOutlined,
} from "@mui/icons-material";
import Header from "../components/Header";
import TrackedLocalitiesCTA from "../components/TrackedLocalitiesCTA";
import Headline from "../components/Headline";
import Footer from "../components/Footer";
import { Trend } from "./api/byTrend";
import {
  fetchNationalSummary,
  NationalSummary,
} from "../server/fetchNationalSummary";
import NationalSummaryCard from "../components/NationalSummaryCard";

const DynamicCovidMap = dynamic(() => import("../components/CovidMap"), {
  loading: () => <Skeleton height="100%" />,
});

const Home: NextPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const theme = useTheme();

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

  const byIncidentStyles = {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  };

  const summary: NationalSummary = props.summary;

  const formatNumber = (n: number): string => {
    return new Intl.NumberFormat("ro-RO", {}).format(
      Number.isInteger(n) ? n : Number(n.toFixed(2))
    );
  };

  return (
    <div className={styles.container}>
      <Head />
      <Header />
      <main className={styles.main}>
        <Grid container justifyContent="center">
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
            <TrackedLocalitiesCTA />
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent="center"
          sx={{
            background: "#efefef",
            p: theme.spacing(6),
            pt: 0,
            mt: theme.spacing(6),
          }}
        >
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
            <Grid container sx={{ margin: `${theme.spacing(8)} auto` }}>
              <Grid item xs={12}>
                <Headline>Situația COVID-19 în România</Headline>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} lg={4}>
                <NationalSummaryCard
                  icon={<CoronavirusOutlined />}
                  main={`${formatNumber(summary.infection.rate)}‰`}
                  trend={Trend.UP}
                  series={summary.infection.data}
                  title="Rata de infecție (incidența)"
                  data={[
                    {
                      main: `${formatNumber(
                        Math.ceil((summary.infection.rate / 1000) * 14000000)
                      )}`,
                      subtext: "Număr persoane",
                    },
                  ]}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <NationalSummaryCard
                  icon={<HealthAndSafetyOutlined />}
                  main={`${formatNumber(summary.vaccination.rate)}%`}
                  trend={Trend.UP}
                  series={summary.vaccination.data}
                  title="Rata de vaccinare"
                  data={[
                    {
                      main: `${formatNumber(summary.vaccination.immunized)}`,
                      subtext: "Imunizați complet",
                    },
                  ]}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <NationalSummaryCard
                  icon={<AirlineSeatFlatOutlined />}
                  main={`${formatNumber(100 - summary.icu.availability)}%`}
                  trend={Trend.DOWN}
                  series={summary.icu.data}
                  title="Ocupare ATI - COVID-19"
                  data={[
                    {
                      main: `${formatNumber(100 - summary.icu.nonICU)}%`,
                      subtext: "Ocupare în afara ATI",
                    },
                  ]}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <NationalSummaryCard
                  icon={<CoronavirusOutlined />}
                  main={`${formatNumber(summary.cases.current)}`}
                  trend={Trend.DOWN}
                  series={summary.cases.data}
                  title="Cazuri noi (ultimele 24h)"
                  data={[
                    {
                      main: `${formatNumber(summary.cases.cured)}%`,
                      subtext: "Vindecați",
                    },
                    {
                      main: `${formatNumber(summary.cases.deceased)}%`,
                      subtext: "Decedați",
                    },
                  ]}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container justifyContent="center">
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
            <Grid container sx={{ margin: `${theme.spacing(8)} auto` }}>
              <Grid item xs={12}>
                <Headline>Hartă</Headline>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: "600px", position: "relative" }}>
                  <DynamicCovidMap layer={CovidMapLayers.COUNTIES} />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                <Button
                  startIcon={<ArrowRight />}
                  href="/harta"
                  variant="outlined"
                  sx={{ mt: 4 }}
                >
                  Vezi harta
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

type ServerSideProps =
  | {
      props: {
        summary: NationalSummary;
      };
      revalidate: number;
    }
  | {
      notFound: true;
    };

export const getStaticProps: GetStaticProps =
  async ({}): Promise<ServerSideProps> => {
    const summary = await fetchNationalSummary();
    return {
      props: {
        summary,
      },
      revalidate: 60 * 60,
    };
  };
