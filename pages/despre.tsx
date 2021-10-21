import { Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { NextPage } from "next";
import React from "react";
import Footer from "../components/Footer";
import { Head } from "../components/Head";
import Header from "../components/Header";
import Headline from "../components/Headline";

const DesprePage: NextPage = () => {
  const theme = useTheme();
  return (
    <div>
      <Head />
      <Header />
      <main style={{ marginBottom: theme.spacing(8) }}>
        <Grid container justifyContent="center">
          <Grid item xs={11} sm={10} md={9} lg={8} xl={6}>
            <Headline>Despre</Headline>
            <Typography>Lorem ipsum dolor sit amet</Typography>
          </Grid>
        </Grid>
      </main>
      <Footer />
    </div>
  );
};

export default DesprePage;
