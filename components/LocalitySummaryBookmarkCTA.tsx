import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import {
  Avatar,
  Box,
  CardActions,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useSetRecoilState } from "recoil";
import { trackedLocalitiesState } from "./TrackedLocalitiesSlider";
import { Locality, LocalityWithFeature } from "../types/Locality";
import { getNewestLocalityData } from "../lib/getNewestLocalityData";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import SimpleLineChart from "./SimpleLineChart";
import { linearRegression } from "simple-statistics";
import {
  BookmarkAdd,
  BookmarkBorder,
  Launch,
  LocationCity,
  MyLocationOutlined,
  Pin,
  Refresh,
  SaveAlt,
  TrendingDown,
  TrendingFlat,
} from "@mui/icons-material";
import { useCallback, useState, useEffect } from "react";
import { Feature } from "@turf/helpers";

type Props = {
  style?: React.CSSProperties;
};

export default function LocalitySummaryBookmarkCTA({ ...rest }: Props) {
  const [locality, setRandomLocality] = useState<Locality>();
  const [loadingLocality, setLoadingLocality] = useState(false);

  const [currentLocationActive, setCurrentLocationActive] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const theme = useTheme();
  const setTrackedLocalities = useSetRecoilState(trackedLocalitiesState);

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

          setCurrentLocationActive(true);
          setLocationLoading(false);
          setRandomLocality(json);
        },
        () => setLocationLoading(false)
      );
    } else {
      setCurrentLocationActive(false);
    }
  }, [currentLocationActive]);

  const fetchRandom = useCallback(async () => {
    setLoadingLocality(true);
    const response = await fetch(`/api/random`);
    const json = await response.json();
    setRandomLocality(json);
    setCurrentLocationActive(false);
    setLoadingLocality(false);
  }, [locality, loadingLocality]);

  useEffect(() => {
    fetchRandom();
  }, []);

  if (!locality) {
    return null;
  }

  const removeLocality = (locality: Locality) => {
    setTrackedLocalities((oldTrackedLocalitiesList) => {
      return oldTrackedLocalitiesList.filter(
        (l) => l.siruta !== locality.siruta
      );
    });
  };

  const number = getNewestLocalityData(locality) || 0;
  let fill = SeverityLevelColor[getSeverityLevel(locality)];

  const data = Object.entries(locality.data);
  const regression = linearRegression(
    data.map(([key, value]) => [new Date(key).valueOf(), value])
  );

  let trend = <TrendingUpIcon />;
  if (regression.b === 0) {
    trend = <TrendingFlat />;
  } else if (regression.b < 0) {
    trend = <TrendingDown />;
  }

  return (
    <Card sx={{ width: 345 }} variant="outlined" {...rest}>
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: SeverityLevelColor[getSeverityLevel(locality)],
              fontSize: ".6rem",
            }}
            aria-label="recipe"
          >
            {trend}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={locality.uat}
        subheader={locality.county}
      />
      <CardMedia sx={{ height: 100, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <SimpleLineChart series={locality.data} />
        </Box>

        <Typography
          gutterBottom
          variant="subtitle2"
          component="div"
          sx={{
            fontFamily: "Roboto, sans-serif",
            position: "absolute",
            bottom: theme.spacing(2),
            left: theme.spacing(2),
            mb: 0,
          }}
        >
          {number.toFixed(2)}‰
        </Typography>
      </CardMedia>
      <Divider variant="middle" />
      <CardContent>
        <List dense={true}>
          <ListItem>
            <ListItemText primary="Spitalizați" secondary={42} />
            <ListItemText primary="Paturi libere ATI" secondary={1} />
          </ListItem>
        </List>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          onClick={fetchRandom}
          disabled={!!locality && loadingLocality}
        >
          <Refresh />
        </IconButton>
        <IconButton
          onClick={getCurrentLocation}
          disabled={currentLocationActive || locationLoading}
        >
          <MyLocationOutlined />
        </IconButton>
        <IconButton onClick={fetchRandom} sx={{ ml: "auto" }}>
          <BookmarkAdd />
        </IconButton>
      </CardActions>
    </Card>
  );
}
