import {
  Box,
  Button,
  Grid,
  IconButton,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";
import SearchAppBar from "../components/SearchAppBar";
import styles from "../styles/Home.module.css";
import { Head } from "../components/Head";
import Data from "../data/octombrie.json";
import { TrackedLocalitiesSlider } from "../components/TrackedLocalitiesSlider";
import SearchInput from "../components/SearchInput";
import LocalitiesByIncidence from "../components/LocalitiesByIncidence";
import { SxProps } from "@mui/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoffee,
  faFont,
  faHandHoldingHeart,
  faHandPaper,
  faHandPeace,
  faHeart,
  faMugHot,
  faTh,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import { LocalityWithFeature } from "../types/Locality";
import LocalitySummaryWidget from "../components/LocalitySummaryWidget";
import { AddAlert, AddchartOutlined, PlusOne } from "@mui/icons-material";
import LocalitySummaryBookmarkCTA from "../components/LocalitySummaryBookmarkCTA";
import CovidMap from "../components/CovidMap";

const Home: NextPage = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

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

      <SearchAppBar />
      <Box
        sx={{
          background: "url(/header.jpg) no-repeat",
          height: matches ? "100px" : "350px",
          width: "100%",
          backgroundSize: "cover",
          backgroundPositionY: "25%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:before": {
            content: `" "`,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, .7)",
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
          },
        }}
      >
        <SearchInput />
      </Box>
      <main className={styles.main}>
        <Grid container justifyContent="center">
          <Grid item xs={8} lg={6} xl={5}>
            <Grid
              container
              justifyContent="space-between"
              sx={{
                mt: 8,
              }}
            >
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: "1.7rem",
                    fontWeight: 500,
                    pb: 6,
                    maxWidth: theme.spacing(60),
                    "&:after": {
                      content: `" "`,
                      display: "block",
                      width: "50%",
                      borderBottom: `5px solid ${theme.palette.primary.main}`,
                      mt: 2,
                    },
                  }}
                >
                  Marchează localitățile de interes personal pentru access ușor
                  mai târziu
                </Typography>
                <Typography>
                  Informațiile sunt salvate doar pe dispozitivul tău, fără a fi
                  necesară crearea unui cont. Va trebui să recreezi lista de
                  localități marcate pe fiecare dispozitiv nou folosit.
                </Typography>
              </Grid>
              <Grid
                item
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
                xs={12}
                md={6}
                justifyContent="end"
              >
                <LocalitySummaryBookmarkCTA />
              </Grid>
            </Grid>
            <Grid container sx={{ margin: `${theme.spacing(8)} auto` }}>
              <Grid item xs={12}>
                <Typography variant="h1" sx={headlineSx}>
                  Hartă
                </Typography>
                <ToggleButtonGroup
                  value={"uats"}
                  exclusive
                  onChange={() => {}}
                  aria-label="text alignment"
                  sx={{ mb: 3 }}
                >
                  <ToggleButton value="uats" aria-label="left aligned">
                    <FontAwesomeIcon icon={faTh} />
                  </ToggleButton>
                  <ToggleButton value="counties" aria-label="centered">
                    <FontAwesomeIcon icon={faThLarge} />
                  </ToggleButton>
                  <ToggleButton value="labeled" aria-label="right aligned">
                    <FontAwesomeIcon icon={faFont} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: "600px", position: "relative" }}>
                  <CovidMap />
                </Box>
              </Grid>
            </Grid>
            {/* <TrackedLocalitiesSlider /> */}
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

export default Home;
