import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { Stack, SvgIcon } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { CSSProperties } from "@mui/system";
import styles from "./SearchAppBar.module.css";

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

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  const navItemSx = {
    color: theme.palette.secondary.main,
    textTransform: "uppercase",
    "&:after": {
      position: "absolute",
      color: "#fff",
      right: "0",
      top: "38px",
      width: "100%",
      content: `" "`,
      display: "block",
      borderBottom: "5px solid #fff",
      transform: "scaleX(0)",
      transition: "transform .3s ease-out",
    },
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{ pt: theme.spacing(2), pb: theme.spacing(2) }}
      >
        <Toolbar>
          <img src="/Logo_DSU.svg" height="70" />
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
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
              <a href="/" onClick={goHome}>
                data.fiipregătit.ro
              </a>
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
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignContent: "center", mr: 3, mb: "-46px" }}
          >
            <a href="/" onClick={goHome} className={styles.navItem}>
              <HomeIcon />
            </a>
            <a href="#" className={styles.navItem}>
              Hartă
            </a>
            <a href="#" className={styles.navItem}>
              fiipregatit.ro
            </a>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
