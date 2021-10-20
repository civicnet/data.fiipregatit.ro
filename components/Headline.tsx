import { Typography, useTheme } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { ReactNode } from "react";

type Props = {
    children?: ReactNode,
}

export default function Headline(props: Props) {
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

  return <Typography variant="h1" sx={headlineSx} {...props} />;
}