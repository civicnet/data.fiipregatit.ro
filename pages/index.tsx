import {
  Box,
  Button,
  Grid,
  Skeleton,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import React from "react";
import styles from "../styles/Home.module.css";
import { Head } from "../components/Head";
import LocalitiesByIncidence from "../components/LocalitiesByIncidence";
import { SxProps } from "@mui/system";
import dynamic from "next/dynamic";
import { CovidMapLayers } from "../components/CovidMap";
import { ArrowRight } from "@mui/icons-material";
import Header from "../components/Header";
import TrackedLocalitiesCTA from "../components/TrackedLocalitiesCTA";
import Headline from "../components/Headline";
import Footer from "../components/Footer";
import LocalitiesByTrend from "../components/LocalitiesByTrend";
import { Trend } from "./api/byTrend";

const DynamicCovidMap = dynamic(() => import("../components/CovidMap"), {
  ssr: false,
  loading: () => <Skeleton height="100%" />,
});

const Home: NextPage = () => {
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

  return (
    <div className={styles.container}>
      <Head />
      <Header />
      <main className={styles.main} style={{ marginBottom: theme.spacing(8) }}>
        <Grid container justifyContent="center">
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
            <TrackedLocalitiesCTA />
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
            {/* <TrackedLocalitiesSlider /> */}
            <Grid container sx={{ margin: `${theme.spacing(8)} auto` }}>
              <Grid item xs={12}>
                <Typography variant="h1" sx={headlineSx}>
                  Localități în scădere
                </Typography>
                <LocalitiesByTrend trend={Trend.DOWN} />
              </Grid>
            </Grid>
            <Grid container sx={{ margin: `${theme.spacing(8)} auto` }}>
              <Grid item xs={12}>
                <Typography variant="h1" sx={headlineSx}>
                  Situația la nivel național
                </Typography>
                <LocalitiesByIncidence
                  low={7.5}
                  high={1000}
                  style={byIncidentStyles}
                />
                <LocalitiesByIncidence
                  low={6}
                  high={7.5}
                  style={byIncidentStyles}
                />
                <LocalitiesByIncidence
                  low={3}
                  high={6}
                  style={byIncidentStyles}
                />
                <LocalitiesByIncidence
                  low={0}
                  high={3}
                  style={byIncidentStyles}
                />
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
