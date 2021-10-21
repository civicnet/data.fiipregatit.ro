import {
  faHeart,
  faCoffee,
  faHandPaper,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Grid, Typography, useTheme } from "@mui/material";
import React from "react";

export default function Footer(props: any) {
  const theme = useTheme();

  return (
    <footer
      style={{
        background: "#4c4c4c",
        padding: theme.spacing(2),
      }}
      {...props}
    >
      <Grid container justifyContent="center">
        <Grid item>
          <Typography sx={{ color: "#bbb", fontSize: "12px" }}>
            Creat cu{" "}
            <Typography sx={{ "&:hover": { color: "#f00" } }} component="span">
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
  );
}
