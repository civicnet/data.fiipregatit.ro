import "../styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { RecoilRoot } from "recoil";
import { DebugObserver } from "../components/DebugObserver";

const theme = createTheme({
  palette: {
    // type: 'light',
    primary: {
      main: "#993333",
    },
    secondary: {
      main: "#FFCC00",
      light: "#FFFFCC",
    },
  },
  typography: {
    h1: {
      fontFamily: '"Merriweather", serif',
    },
    h2: {
      fontFamily: '"Merriweather", serif',
    },
    h3: {
      fontFamily: '"Merriweather", serif',
    },
    h4: {
      fontFamily: '"Merriweather", serif',
    },
    h5: {
      fontFamily: '"Merriweather", serif',
    },
    h6: {
      fontFamily: '"Merriweather", serif',
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <DebugObserver />
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </RecoilRoot>
  );
}
export default MyApp;
