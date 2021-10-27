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
  Skeleton,
  Tooltip,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Locality } from "../types/Locality";
import { getNewestLocalityData } from "../lib/getNewestLocalityData";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import SimpleLineChart from "./SimpleLineChart";
import { linearRegression } from "simple-statistics";
import {
  ArrowDownward,
  ArrowRight,
  ArrowUpward,
  BookmarkAddOutlined,
  MyLocationOutlined,
  Refresh,
  Room,
  TrendingDown,
  TrendingFlat,
} from "@mui/icons-material";
import { useCallback, useState, useEffect } from "react";
import { trackedLocalitiesState } from "../store/trackedLocalitiesState";
import { useRecoilState } from "recoil";
import SkeletonCard from "./SkeletonCard";
import { Trend } from "../pages/api/byTrend";
import TrendArrow from "./TrendArrow";

type Props = {
  style?: React.CSSProperties;
};

export default function LocalitySummaryBookmarkCTA({ ...rest }: Props) {
  const [locality, setRandomLocality] = useState<Locality>();
  const [loadingLocality, setLoadingLocality] = useState(false);
  const [currentLocationActive, setCurrentLocationActive] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [trackedLocalities, setTrackedLocalities] = useRecoilState(
    trackedLocalitiesState
  );
  const theme = useTheme();

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
    return <SkeletonCard width="100%" />;
  }

  const number = getNewestLocalityData(locality) || 0;
  let fill = SeverityLevelColor.geojson[getSeverityLevel(locality)];

  const data = Object.entries(locality.data);
  const regression = linearRegression(
    data.map(([key, value]) => [new Date(key).valueOf(), Number(value)])
  );

  let trend = <TrendArrow trend={Trend.DOWN} />;
  if (regression.b === 0) {
    trend = <TrendArrow trend={Trend.FLAT} />;
  } else if (regression.b < 0) {
    trend = <TrendArrow trend={Trend.UP} />;
  }

  const trackLocality = () => {
    if (!locality || trackedLocalities.includes(locality.siruta)) {
      return;
    }

    setTrackedLocalities([...trackedLocalities, locality.siruta]);
  };

  return (
    <>
      <Card sx={{ minWidth: { xs: "100%", sm: 300 }, }} variant="outlined" {...rest}>
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: SeverityLevelColor.geojson[getSeverityLevel(locality)],
                fontSize: ".6rem",
              }}
              aria-label="recipe"
            >
              <Room />
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
        <CardMedia
          sx={{
            height: 100,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            <SimpleLineChart
              series={locality.data}
              color={SeverityLevelColor.geojson[getSeverityLevel(locality)]}
            />
          </Box>
        </CardMedia>
        <Divider variant="middle" />
        <CardContent>
          <Box
            sx={{
              textAlign: "center",
              mt: theme.spacing(2),
              mb: theme.spacing(2),
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: theme.spacing(2),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {trend}
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "Roboto, sans-serif",
                }}
              >
                {number.toFixed(2)}‰
              </Typography>
            </Box>
            <Typography variant="overline">Rată de incidență</Typography>
          </Box>
        </CardContent>
        <CardActions disableSpacing>
          <Tooltip title="Altă localitate">
            <span>
              <IconButton
                onClick={fetchRandom}
                disabled={!!locality && loadingLocality}
                size="large"
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Caută localitatea mea">
            <span>
              <IconButton
                onClick={getCurrentLocation}
                disabled={currentLocationActive || locationLoading}
                size="large"
              >
                <MyLocationOutlined />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={`Marchează ${locality.uat}, jud. ${locality.county}`}>
            <IconButton
              onClick={trackLocality}
              sx={{ ml: "auto" }}
              size="large"
            >
              <BookmarkAddOutlined />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </>
  );
}
