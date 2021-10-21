import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import HomeIcon from "@mui/icons-material/Home";
import { Stack, useMediaQuery } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import styles from "./SearchAppBar.module.css";
import { Menu } from "@mui/icons-material";
import clsx from "clsx";
import Link from "next/link";

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function SearchAppBar() {
  const theme = useTheme();
  const router = useRouter();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{ pt: theme.spacing(2), pb: theme.spacing(2) }}
      >
        <Toolbar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <img src="/Logo_DSU.svg" height="70" width="70" />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              ml: theme.spacing(2),
            }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                color: theme.palette.secondary.light,
              }}
            >
              <Link href="/">
              <a>
                data.fiipregătit.ro
              </a>
              </Link>
            </Typography>
            <Typography
              sx={{
                textTransform: "uppercase",
                fontSize: "11px",
                letterSpacing: "1px",
                whiteSpace: "normal",
                maxWidth: "300px",
              }}
            >
              Platforma națională de date deschise pentru situații de urgență
            </Typography>
          </Box>
          {!matches && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignContent: "center", mr: 3, mb: "-46px" }}
            >
              <Link href="/">
                <a className={clsx(styles.navItem, router.pathname === "/" && styles.navItemActive)}>
                  <HomeIcon />
                </a>
              </Link>
              <Link href="/despre">
                <a className={clsx(styles.navItem, router.pathname === "/despre" && styles.navItemActive)}>
                  Despre
                </a>
              </Link>
              <Link href="/harta">
                <a className={clsx(styles.navItem, router.pathname === "/harta" && styles.navItemActive)}>
                  Hartă
                </a>
              </Link>
              <a
                href="https://fiipregatit.ro"
                target="_blank"
                className={styles.navItem}
              >
                fiipregatit.ro
              </a>
            </Stack>
          )}
          {matches && (
            <Menu
              sx={{ color: "#fff", height: 44, width: 44, cursor: "pointer" }}
            />
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
