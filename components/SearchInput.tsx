import * as React from "react";
import Paper, { PaperProps } from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import TableViewIcon from "@mui/icons-material/TableView";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ViewIcon from "@mui/icons-material/Visibility";
import { MapIcon } from "./MapIcon";
import {
  Box,
  Fade,
  Grid,
  Grow,
  List,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  makeStyles,
  MenuItem,
  MenuList,
  Popper,
  PopperProps,
  Portal,
  styled,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import * as turf from "@turf/turf";
import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { Check } from "@mui/icons-material";
import { Locality } from "../types/Locality";
import { labelForLocality } from "../lib/labelForLocality";
import { SeverityLevelDescription } from "../lib/SeverityLevelDescription";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getNewestLocalityData } from "../lib/getNewestLocalityData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyringe } from "@fortawesome/free-solid-svg-icons/faSyringe";
import {
  faLevelDownAlt,
  faLevelUpAlt,
  faVirus,
} from "@fortawesome/free-solid-svg-icons";
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

  const router = useRouter();
  const theme = useTheme();
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
          const json: Feature = await data.json();

          setValue(`${json.properties?.name}, ${json.properties?.county}`);
          setCurrentLocationActive(true);
          setLocationLoading(false);
        },
        () => setLocationLoading(false)
      );
    } else {
      setCurrentLocationActive(false);
      setValue("");
    }
  }, [currentLocationActive, value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
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
      // up arrow
      moveUp();
    } else if (e.key === "ArrowDown") {
      // down arrow
      moveDown();
    }
  };

  return (
    <Grid container xs={11} lg={12} justifyContent="center">
      <Grid item xs={11} lg={4} xl={3} justifyContent="center">
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            position: "relative",
            // width: 600,
            ...popperStyles,
          }}
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
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton
            color="primary"
            sx={{ p: "10px" }}
            aria-label="directions"
          >
            <MapIcon />
          </IconButton>
          {value && (
            <Portal container={container.current as any}>
              <Grow in={!!value}>
                <Paper sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                  <List>
                    {suggestions.map((s, idx) => (
                      <ListItem>
                        <ListItemButton
                          selected={idx === activeSuggestion}
                          classes={{
                            selected: styles.selected,
                          }}
                          onClick={() => {
                            setValue("");
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
                </Paper>
              </Grow>
            </Portal>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
