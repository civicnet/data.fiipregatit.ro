import { BookmarkAddOutlined } from "@mui/icons-material";
import { Grid, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { trackedLocalitiesState } from "../store/trackedLocalitiesState";
import { LocalityWithFeatureAndHospitals } from "../types/Locality";
import LocalitySummaryBookmarkCTA from "./LocalitySummaryBookmarkCTA";
import LocalitySummaryWidget from "./LocalitySummaryWidget";
import SkeletonCard from "./SkeletonCard";

export default function TrackedLocalitiesCTA() {
  const [trackedLocalityCodes, setTrackedLocalityCodes] = useRecoilState(
    trackedLocalitiesState
  );
  const [trackedLocalities, setTrackedLocalities] = useState<
    LocalityWithFeatureAndHospitals[]
  >([]);

  const theme = useTheme();

  const fetchLocalities = useCallback(async () => {
    const fetchSingle = async (code: string) => {
      const response = await fetch(`/api/bySiruta?code=${code}`);
      const json: LocalityWithFeatureAndHospitals = await response.json();
      return json;
    };

    const localities = await Promise.all(
      trackedLocalityCodes.map((code) => fetchSingle(code))
    );
    setTrackedLocalities(localities);
  }, [trackedLocalityCodes]);

  useEffect(() => {
    fetchLocalities();
  }, [trackedLocalityCodes]);

  if (!trackedLocalityCodes.length) {
    return (
      <Grid
        container
        justifyContent="space-between"
        spacing={2}
        sx={{
          mt: 8,
        }}
      >
        <Grid item xs={12} sm={6} sx={{ mb: { xs: theme.spacing(3) }, pr: 3 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: "1.7rem",
              fontWeight: 500,
              pb: 6,
              maxWidth: theme.spacing(60),
              "&:after": {
                content: `" "`,
                display: "block",
                width: "50%",
                borderBottom: `5px solid ${theme.palette.primary.main}`,
                mt: 2,
              },
            }}
          >
            Marchează localitățile de interes personal pentru access ușor mai
            târziu
          </Typography>
          <Typography>
            Oriunde vezi pictograma
            <Box
              sx={{
                height: "1rem",
                bottom: 0,
                position: "relative",
                width: "1.5rem",
                display: "inline-block",
              }}
            >
              <BookmarkAddOutlined
                sx={{
                  position: "absolute",
                  width: "1.2rem",
                  height: "1.2rem",
                  left: "50%",
                  top: "50%",
                  translate: "-50% -50%",
                }}
              />
            </Box>
            atașată unei localități, o poți folosi pentru a marca o locație.
          </Typography>
          <Typography sx={{ mt: "2rem" }}>
            Informațiile sunt salvate doar pe dispozitivul tău, fără a fi
            necesară crearea unui cont. Va trebui să recreezi lista de
            localități marcate pe fiecare dispozitiv nou folosit.
          </Typography>
        </Grid>
        <Grid
          item
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: { sm: "end", xs: "center" },
          }}
          xs={12}
          sm={6}
        >
          <LocalitySummaryBookmarkCTA />
        </Grid>
      </Grid>
    );
  }

  if (trackedLocalities.length) {
    return (
      <Grid
        container
        spacing={2}
        sx={{
          mt: 8,
        }}
      >
        {trackedLocalities.map((l) => {
          return (
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={`tracked-locality-${l.siruta}`}
            >
              <LocalitySummaryWidget locality={l} />
            </Grid>
          );
        })}
      </Grid>
    );
  }

  return (
    <Grid
      container
      spacing={2}
      sx={{
        mt: 8,
      }}
    >
      <Grid item xs={12} md={6} lg={4} key={`tracked-locality-skeleton`}>
        <SkeletonCard style={{ width: 345 }} />
      </Grid>
    </Grid>
  );
}
