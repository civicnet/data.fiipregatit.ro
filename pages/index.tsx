import {
  Box,
  Grid,
  Theme,
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
  faHandHoldingHeart,
  faHandPaper,
  faHandPeace,
  faHeart,
  faMugHot,
} from "@fortawesome/free-solid-svg-icons";

const Home: NextPage = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const sortedUATs = Data.sort(
    (a, b) => b.data["2021-10-14"] - a.data["2021-10-14"]
  );

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
        {/* <TrackedLocalitiesSlider /> */}
        <Grid container spacing={2} xs={12} lg={8} sx={{ margin: "0 auto" }}>
          <Grid item xs={12}>
            <Typography variant="h1" sx={headlineSx}>
              Peste 7,5‰
            </Typography>
            <LocalitiesByIncidence low={7.5} high={1000} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h1" sx={headlineSx}>
              Între 6‰ și 7,5‰
            </Typography>
            <LocalitiesByIncidence low={6} high={7.5} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h1" sx={headlineSx}>
              Între 3‰ și 6‰
            </Typography>
            <LocalitiesByIncidence low={3} high={6} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h1" sx={headlineSx}>
              Sub 3‰
            </Typography>
            <LocalitiesByIncidence low={0} high={3} />
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
