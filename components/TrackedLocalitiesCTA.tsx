import { BookmarkAddOutlined } from "@mui/icons-material";
import { Grid, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { trackedLocalitiesState } from "../store/trackedLocalitiesState";
import { LocalityWithFeature } from "../types/Locality";
import Headline from "./Headline";
import LocalitySummaryBookmarkCTA from "./LocalitySummaryBookmarkCTA";
import LocalitySummaryWidget from "./LocalitySummaryWidget";
import SkeletonCard from "./SkeletonCard";

export default function TrackedLocalitiesCTA() {
  const [trackedLocalityCodes, setTrackedLocalityCodes] = useRecoilState(
    trackedLocalitiesState
  );

  const [trackedLocalities, setTrackedLocalities] = useState<
    LocalityWithFeature[]
  >([]);

  const fetchLocalities = useCallback(async () => {
    const fetchSingle = async (code: string) => {
      const response = await fetch(`/api/bySiruta?code=${code}`);
      const json: LocalityWithFeature = await response.json();
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

  const theme = useTheme();

  return !trackedLocalityCodes.length ? (
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
          Informațiile sunt salvate doar pe dispozitivul tău, fără a fi necesară
          crearea unui cont. Va trebui să recreezi lista de localități marcate
          pe fiecare dispozitiv nou folosit.
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
        <LocalitySummaryBookmarkCTA tourStarted={false} />
      </Grid>
    </Grid>
  ) : (
    <>
      <Headline>Localități marcate</Headline>
      <Grid
        container
        justifyContent="space-between"
        spacing={2}
        sx={{
          mt: 8,
        }}
      >
        {true
          ? trackedLocalities.map((l) => {
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
            })
          : Array(3)
              .fill(1)
              .map((_, idx) => (
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  key={`tracked-locality-skeleton-${idx}`}
                >
                  <SkeletonCard />
                </Grid>
              ))}
      </Grid>
    </>
  );
}
