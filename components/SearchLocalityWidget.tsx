import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { matchSorter } from "match-sorter";
import React from "react";
import { useSetRecoilState } from "recoil";
import Data from "../data/octombrie.json";
import { labelForLocality } from "../lib/labelForLocality";
import { toTitleCase } from "../lib/toTitleCase";
import { Locality } from "../types/Locality";
import { selectedLocalityForTrackingState } from "./TrackedLocalitiesSlider";

type Props = {
  name: string;
};

const data = Data.map((l) => ({ label: labelForLocality(l), ...l }));

export function SearchLocalityWidget({ name }: Props) {
  const setSelectedLocality = useSetRecoilState(
    selectedLocalityForTrackingState
  );

  const setSelected = (locality?: Locality) => {
    setSelectedLocality((_oldSelectedLocality) => {
      return locality?.siruta;
    });
  };
  
  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: (option: Locality) => labelForLocality(option),
    limit: 10,
  });

  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={data}
      autoHighlight
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      blurOnSelect
      filterOptions={filterOptions}
      sx={{ width: 300 }}
      onChange={(_ev, value) =>
        value ? setSelected(value) : setSelected(undefined)
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Localitate..."
          inputProps={{
            ...params.inputProps,
            autoComplete: "new-password",
          }}
        />
      )}
    />
  );
}
