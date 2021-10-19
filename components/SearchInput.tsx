import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import {
  Box,
  ClickAwayListener,
  Fade,
  Grid,
  Grow,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Portal,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Locality } from "../types/Locality";
import { getNewestLocalityData } from "../lib/getNewestLocalityData";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import styles from "./SearchInput.module.css";
import { Feature } from "@turf/turf";
import { useRouter } from "next/dist/client/router";

const LIMIT = 5;

export default function SearchInput() {
  const [value, setValue] = useState<string>("");
  const [currentLocationActive, setCurrentLocationActive] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Locality[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [suggestionCount, setSuggestionCount] = useState<number>(0);
  const [isSuggestionPopupOpen, setIsSuggestionPopupOpen] = useState(false);

  const router = useRouter();
  const container = useRef(null);

  useEffect(() => {
    (async () => {
      const results = await fetch(`/api/search?q=${value}&limit=${LIMIT}`);
      const json = await results.json();

      setSuggestions(json.data.map((s: any) => s.item));
      setSuggestionCount(json.info.total);
    })();
  }, [value]);

  const getCurrentLocation = useCallback(() => {
    if (!currentLocationActive) {
      if (locationLoading) {
        return;
      }

      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const data = await fetch(
            `/api/geocode?lat=${latitude}&lng=${longitude}`
          );
          const json: Locality = await data.json();

          setValue(`${json.uat}, ${json.county}`);
          setIsSuggestionPopupOpen(true);
          setCurrentLocationActive(true);
          setLocationLoading(false);
        },
        () => setLocationLoading(false)
      );
    } else {
      setCurrentLocationActive(false);
      setValue("");
      setIsSuggestionPopupOpen(false);
    }
  }, [currentLocationActive, value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setIsSuggestionPopupOpen(!!event.target.value);
    if (currentLocationActive) {
      setCurrentLocationActive(false);
    }
  };

  const popperStyles = !!value
    ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
    : {};

  const moveUp = () => {
    if (activeSuggestion > 0) {
      setActiveSuggestion(activeSuggestion - 1);
      return;
    }
    setActiveSuggestion(suggestions.length - 1);
  };

  const moveDown = () => {
    const max = suggestions.length;
    if (max > 0 && activeSuggestion < max - 1) {
      setActiveSuggestion(activeSuggestion + 1);
      return;
    }
    setActiveSuggestion(0);
  };

  const onKeyPressed = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      moveUp();
    } else if (e.key === "ArrowDown") {
      moveDown();
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const suggestion = suggestions[activeSuggestion];
    router.push(`/localities/${suggestion.siruta}`);
  };

  const handleClickAway = () => {
    setIsSuggestionPopupOpen(false);
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={11} lg={4} xl={3} justifyContent="center">
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            position: "relative",
            ...popperStyles,
          }}
          onSubmit={onSubmit}
        >
          <IconButton
            sx={{ p: "10px" }}
            aria-label="menu"
            onClick={getCurrentLocation}
            color={currentLocationActive ? "primary" : "inherit"}
          >
            <MyLocationIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Caută localitate (ex. Alba Iulia)"
            inputProps={{ "aria-label": "Caută localitate (ex. Alba Iulia)" }}
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyPressed}
          />
          <Box
            ref={container}
            sx={{
              position: "absolute",
              top: "48px",
              width: "100%",
              left: 0,
              zIndex: 1000,
            }}
          ></Box>
          <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
          {isSuggestionPopupOpen && (
            <Portal container={container.current as any}>
              <Grow in={!!value}>
                <Paper sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                  <ClickAwayListener onClickAway={handleClickAway}>
                    <List>
                      {suggestions.map((s, idx) => (
                        <ListItem key={`suggestion-${s.siruta}`}>
                          <ListItemButton
                            selected={idx === activeSuggestion}
                            classes={{
                              selected: styles.selected,
                            }}
                            onClick={() => {
                              setValue("");
                              setIsSuggestionPopupOpen(false);
                              router.push(`/localities/${s.siruta}`);
                            }}
                          >
                            <ListItemText
                              primary={`${s.uat}`}
                              secondary={`Județ ${
                                s.county
                              }, incidență ${getNewestLocalityData(s)?.toFixed(
                                2
                              )}‰`}
                            />

                            <KeyboardReturnIcon />
                          </ListItemButton>
                        </ListItem>
                      ))}
                      {suggestionCount > LIMIT && (
                        <ListItem>
                          <ListItemButton>
                            <ListItemText
                              secondary={`Vezi alte ${
                                suggestionCount - LIMIT
                              } sugestii.`}
                            />
                            <KeyboardReturnIcon />
                          </ListItemButton>
                        </ListItem>
                      )}
                    </List>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            </Portal>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
