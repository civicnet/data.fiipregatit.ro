import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import {
  Avatar,
  Box,
  Button,
  CardActions,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useSetRecoilState } from "recoil";
import GeoJSONFeature from "./GeoJSONFeature";
import { labelForLocality } from "../lib/labelForLocality";
import { trackedLocalitiesState } from "./TrackedLocalitiesSlider";
import { Locality, LocalityWithFeature } from "../types/Locality";
import { getNewestLocalityData } from "../lib/getNewestLocalityData";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import { SeverityLevel } from "../lib/SeverityLevel";
import SimpleLineChart from "./SimpleLineChart";
import { linearRegression } from "simple-statistics";
import {
  BookmarkBorder,
  Launch,
  Pin,
  TrendingDown,
  TrendingFlat,
} from "@mui/icons-material";

type Props = {
  locality: LocalityWithFeature;
};

export default function LocalitySummaryWidget({ locality }: Props) {
  const theme = useTheme();

  const setTrackedLocalities = useSetRecoilState(trackedLocalitiesState);

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
    <Card sx={{ maxWidth: 345 }} variant="outlined">
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
        <Button size="small">Detalii</Button>
        <Button size="small">Urmărește</Button>
        <Button size="small">Restricții</Button>
      </CardActions>
    </Card>
  );
}
