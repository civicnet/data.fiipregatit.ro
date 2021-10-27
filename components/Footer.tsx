import {
  faHeart,
  faCoffee,
  faHandPaper,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FacebookOutlined, Instagram, YouTube } from "@mui/icons-material";
import { Box, Grid, Link, Typography, useTheme } from "@mui/material";
import React from "react";
import classes from "./Footer.module.css";

export default function Footer(props: any) {
  const theme = useTheme();

  return (
    <footer
      style={{
        background: "#4c4c4c",
      }}
      {...props}
    >
      <Grid
        container
        justifyContent="center"
        sx={{
          background: "#333",
        }}
      >
        <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
          <Grid
            container
            justifyContent="space-between"
            className={classes.list}
          >
            <Grid
              item
              xs={12}
              md={6}
              lg={2}
              sx={{ textAlign: { xs: "center", sm: "left" } }}
            >
              <ul>
                <li>
                  <Typography variant="overline" sx={{ color: "#fff" }}>
                    Meniu
                  </Typography>
                </li>
                <li>
                  <Link href="/">Acasă</Link>
                </li>
                <li>
                  <Link href="/harta">Hartă</Link>
                </li>
                <li>
                  <Link href="/despre">Despre</Link>
                </li>
              </ul>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{ textAlign: { xs: "center", sm: "left" } }}
            >
              <ul>
                <li>
                  <Typography variant="overline" sx={{ color: "#fff" }}>
                    Ghiduri COVID-19
                  </Typography>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro/ghid/starea-de-alerta/">
                    Stare de alertă
                  </Link>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro/ghid/conditii-intrare-in-romania-strainatate/">
                    Călătorie în țară sau în străinătate
                  </Link>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro/ghid/covid19-cumparaturi/">
                    Cumpărături
                  </Link>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro/ghid/covid19-transport-comun/">
                    Transport în comun
                  </Link>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro/ghid/covid19-autoizolare-izolare-covid-la-domiciliu/">
                    Autoizolare la domiciliu
                  </Link>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro/ghid/covid19-simptome/">
                    Simptome
                  </Link>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro/ghid/covid19-intrebari-frecvente-si-mituri/">
                    Întrebări și mituri
                  </Link>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro/ghid/covid19-informare-corecta/">
                    Informare corectă
                  </Link>
                </li>
              </ul>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{ textAlign: { xs: "center", sm: "left" } }}
            >
              <ul>
                <li>
                  <Typography variant="overline" sx={{ color: "#fff" }}>
                    Legături utile
                  </Typography>
                </li>
                <li>
                  <Link href="https://fiipregatit.ro">fiipregatit.ro</Link>
                </li>
                <li>
                  <Link href="https://vaccinare-covid.gov.ro/platforma-programare/">
                    Hartă Centre de Vaccinare COVID-19
                  </Link>
                </li>
                <li>
                  <Link href="https://certificat-covid.gov.ro/">
                    Certificat Digital COVID-19
                  </Link>
                </li>
                <li>
                  <Link href="https://play.google.com/store/apps/details?id=ro.sts.dcc&gl=RO">
                    Aplicația "Check DCC" (Android)
                  </Link>
                </li>
                <li>
                  <Link href="https://certificat-covid.gov.ro/check-dcc">
                    Aplicația "Check DCC" (Web)
                  </Link>
                </li>
                <li>
                  <Link href="https://data.gov.ro/dataset/transparenta-covid">
                    Transparență Date COVID-19
                  </Link>
                </li>
              </ul>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              lg={2}
              sx={{ textAlign: { xs: "center", sm: "left" } }}
            >
              <ul>
                <li>
                  <Typography variant="overline" sx={{ color: "#fff" }}>
                    Social Media
                  </Typography>
                </li>
                <li>
                  <Link
                    href="https://www.facebook.com/departamenturgente"
                    className={classes.socialMedia}
                  >
                    <FacebookOutlined /> Facebook
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.youtube.com/channel/UC5qTBf9rEFj2UdxNEQOzlxA"
                    className={classes.socialMedia}
                  >
                    <YouTube /> YouTube
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.instagram.com/dsu_romania/?hl=en"
                    className={classes.socialMedia}
                  >
                    <Instagram /> Instagram
                  </Link>
                </li>
              </ul>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid
        container
        justifyContent="center"
        sx={{
          p: theme.spacing(2),
        }}
      >
        <Grid item xs={11} sm={10} md={9} xl={6}>
          <Grid container justifyContent="center" className={classes.list}>
            <Grid
              item
              sx={{ display: "flex", mt: { xs: theme.spacing(4) } }}
              xs={12}
              lg={3}
            >
              <img
                src="/Logo_DSU.svg"
                height="80"
                width="80"
                style={{ marginRight: theme.spacing(2) }}
              />
              <Typography
                variant="h4"
                fontFamily="Roboto, sans-serif"
                sx={{ color: "#bbb", fontSize: "1rem", fontWeight: 700 }}
              >
                Departamentul pentru <br /> Situații de Urgență
                <Typography
                  sx={{ color: "#bbb", mt: "1.1rem", fontSize: ".8rem" }}
                  variant="subtitle2"
                >
                  Toate drepturile rezervate @ {new Date().getFullYear()}
                </Typography>
              </Typography>
            </Grid>

            <Grid
              item
              sx={{ display: "flex", mt: { xs: theme.spacing(4) } }}
              xs={12}
              lg={4}
            >
              <img
                src="/Stema_IGSU.png"
                height="80"
                style={{ marginRight: theme.spacing(2), alignSelf: "center" }}
              />
              <Typography
                variant="h4"
                fontFamily="Roboto, sans-serif"
                sx={{
                  color: "#bbb",
                  fontSize: "1rem",
                  fontWeight: 700,
                  alignSelf: "center",
                }}
              >
                Inspectoratul General pentru Situații de Urgență
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              lg={2}
              sx={{ mt: { md: theme.spacing(4), xs: theme.spacing(4), display: "flex" } }}
            >
              <Box sx={{ alignSelf: "center" }}>
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
                  style={{ width: "150px" }}
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
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </footer>
  );
}
