import { Box, Button, Paper, useTheme } from "@mui/material";
import React from "react";
import { SearchLocalityWidget } from "./SearchLocalityWidget";
import AddLocationIcon from "@mui/icons-material/AddLocationAlt";
import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import { recoilPersist } from "recoil-persist";
import Data from "../data/octombrie.json";
import { labelForLocality } from "../lib/labelForLocality";
import LocalityRateWidget from "./LocalitySummaryWidget";
import { Locality } from "../types/Locality";
import { getNewestLocalityData } from "../lib/getNewestLocalityData";

const { persistAtom } = recoilPersist();

type TrackedLocality = {
  siruta: string;
};

export const trackedLocalitiesState = atom<TrackedLocality[]>({
  key: "trackedLocalitiesState",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const selectedLocalityForTrackingState = atom<string | undefined>({
  key: "selectedLocalityForTrackingState",
  default: undefined,
});

export function TrackedLocalitiesSlider() {
  const theme = useTheme();

  const trackedLocalities = useRecoilValue(trackedLocalitiesState);
  const selectedLocality = useRecoilValue(selectedLocalityForTrackingState);
  const setTrackedLocalities = useSetRecoilState(trackedLocalitiesState);

  const addLocality = (siruta?: string) => {
    if (!siruta) {
      return;
    }

    setTrackedLocalities((oldTrackedLocalitiesList) => {
      const needle = Data.find((l) => l.siruta === siruta);

      if (!needle) {
        return oldTrackedLocalitiesList;
      }

      return [
        ...oldTrackedLocalitiesList,
        {
          siruta: needle.siruta,
        },
      ];
    });
  };

  const localities = trackedLocalities.length
    ? trackedLocalities.map((locality) => {
        const needle = Data.find((l) => l.siruta === locality.siruta);

        if (!needle) {
          return null;
        }

        const number = getNewestLocalityData(needle);

        return <LocalityRateWidget locality={needle} key={locality.siruta} />;
      })
    : [];

  if (!localities.length) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(2),
      }}
      elevation={0}
    >
      {localities}

      <Box sx={{ justifyItems: "center" }}>
        <SearchLocalityWidget name="" />
        <Button
          variant="outlined"
          endIcon={<AddLocationIcon />}
          disabled={!selectedLocality}
          onClick={() => addLocality(selectedLocality)}
          sx={{ mt: 2 }}
        >
          Urmărește
        </Button>
      </Box>
    </Paper>
  );
}
