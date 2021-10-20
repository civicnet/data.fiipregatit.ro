import {
  Box,
  Grid,
  Skeleton,
  Stack,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import React, { MouseEvent, useState } from "react";
import styles from "../styles/Home.module.css";
import { Head } from "../components/Head";
import LocalitiesByIncidence from "../components/LocalitiesByIncidence";
import { SxProps } from "@mui/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoffee,
  faFont,
  faHandPaper,
  faHeart,
  faTh,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import LocalitySummaryBookmarkCTA from "../components/LocalitySummaryBookmarkCTA";
import dynamic from "next/dynamic";
import { CovidMapLayers } from "../components/CovidMap";
import { BookmarkAddOutlined } from "@mui/icons-material";
import Header from "../components/Header";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { SeverityLevelDescription } from "../lib/SeverityLevelDescription";
import { SeverityLevel } from "../lib/SeverityLevel";

const DynamicCovidMap = dynamic(() => import("../components/CovidMap"), {
  ssr: false,
  loading: () => <Skeleton height="100%" />,
});

const Home: NextPage = () => {
  const [selectedLayer, setSelectedLayer] = useState(CovidMapLayers.COUNTIES);
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

  const selectLayer = (_e: MouseEvent, layer: CovidMapLayers) => {
    setSelectedLayer(layer);
  };

  return (
    <div className={styles.container}>
      <Head />
      <Header />
      <main className={styles.main}>
        <Grid container justifyContent="center">
          <Grid item xs={11} lg={6} xl={5}>
            <Grid
              container
              justifyContent="space-between"
              sx={{
                mt: 8,
              }}
            >
              <Grid item xs={12} md={6} sx={{ mb: { xs: theme.spacing(3) } }}>
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
                  <BookmarkAddOutlined sx={{ mr: 2 }} />
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
                <Box sx={{ mb: 3, display: "flex" }}>
                  <ToggleButtonGroup
                    value={selectedLayer}
                    exclusive
                    onChange={selectLayer}
                    aria-label="text alignment"
                  >
                    <ToggleButton
                      value={CovidMapLayers.UATS}
                      aria-label="left aligned"
                    >
                      <FontAwesomeIcon icon={faTh} />
                    </ToggleButton>
                    <ToggleButton
                      value={CovidMapLayers.COUNTIES}
                      aria-label="centered"
                    >
                      <FontAwesomeIcon icon={faThLarge} />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: "600px", position: "relative" }}>
                  <DynamicCovidMap layers={[selectedLayer]} />
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
            <img
              src="/CivicNetLogoNegative.svg"
              width="150px"
              height="35.6167px"
            />
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
