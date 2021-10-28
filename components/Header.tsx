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
          background: `linear-gradient(to bottom, #323232 0%, #3F3F3F 40%, #1C1C1C 150%), linear-gradient(to top, rgba(255,255,255,0.40) 0%, rgba(0,0,0,0.25) 200%)`,
          backgroundBlendMode: `multiply`,
          height: 150,
          width: "100%",
          backgroundSize: "cover",
          backgroundPositionY: "25%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SearchInput />
      </Box>
    </>
  );
}
