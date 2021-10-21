import { Box } from "@mui/material";
import React from "react";
import SearchAppBar from "./SearchAppBar";
import SearchInput from "./SearchInput";

export default function Header() {
  return (
    <>
      <SearchAppBar />
      <Box
        sx={{
          background: `
            linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%), 
            radial-gradient(at top center, rgba(255,255,255,0.40) 0%, rgba(0,0,0,0.40) 120%) #989898
          `,
          backgroundBlendMode: "multiply,multiply",
          height: 150,
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
    </>
  );
}
