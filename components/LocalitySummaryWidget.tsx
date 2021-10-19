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
import { LocalityWithFeature } from "../types/Locality";
import { getNewestLocalityData } from "../lib/getNewestLocalityData";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import SimpleLineChart from "./SimpleLineChart";
import { linearRegression } from "simple-statistics";
import {
  BookmarkAdd,
  Launch,
  Rule,
  TrendingDown,
  TrendingFlat,
} from "@mui/icons-material";

type Props = {
  style?: React.CSSProperties;
  locality: LocalityWithFeature;
};

export default function LocalitySummaryWidget({ locality, ...rest }: Props) {
  const theme = useTheme();

  const number = getNewestLocalityData(locality) || 0;
  
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
    <Card sx={{ maxWidth: 345 }} variant="outlined" {...rest}>
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
        <IconButton>
          <BookmarkAdd />
        </IconButton>
        <IconButton href="https://fiipregatit.ro" target="_blank">
          <Rule />
        </IconButton>
        <IconButton sx={{ ml: "auto" }}>
          <Launch />
        </IconButton>
      </CardActions>
    </Card>
  );
}
