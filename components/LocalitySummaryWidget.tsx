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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { LocalityWithFeature } from "../types/Locality";
import { getNewestLocalityData } from "../lib/getNewestLocalityData";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { getSeverityLevel } from "../lib/getSeverityLevel";
import SimpleLineChart from "./SimpleLineChart";
import { linearRegression } from "simple-statistics";
import {
  BookmarkAddOutlined,
  BookmarkRemoveOutlined,
  Code,
  Launch,
  Rule,
  Share,
  TrendingDown,
  TrendingFlat,
  TrendingUp,
} from "@mui/icons-material";
import { useRecoilState } from "recoil";
import { trackedLocalitiesState } from "../store/trackedLocalitiesState";
import { useRouter } from "next/router";

type Props = {
  style?: React.CSSProperties;
  locality: LocalityWithFeature;
};

export default function LocalitySummaryWidget({ locality, ...rest }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [trackedLocalities, setTrackedLocalities] = useRecoilState(
    trackedLocalitiesState
  );

  const theme = useTheme();
  const router = useRouter();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const id = !!anchorEl ? "simple-popover" : undefined;

  const number = getNewestLocalityData(locality) || 0;

  const data = Object.entries(locality.data);
  const regression = linearRegression(
    data.map(([key, value]) => [new Date(key).valueOf(), Number(value)])
  );

  let trend = <TrendingDown />;
  if (regression.b === 0) {
    trend = <TrendingFlat />;
  } else if (regression.b < 0) {
    trend = <TrendingUp />;
  }

  const trackLocality = () => {
    if (!locality || trackedLocalities.includes(locality.siruta)) {
      return;
    }

    setTrackedLocalities([...trackedLocalities, locality.siruta]);
  };

  const untrackLocality = () => {
    if (!locality || !trackedLocalities.includes(locality.siruta)) {
      return;
    }

    setTrackedLocalities(
      trackedLocalities.filter((l) => l !== locality.siruta)
    );
  };

  return (
    <Card sx={{ maxWidth: 345 }} variant="outlined" {...rest}>
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: SeverityLevelColor.geojson[getSeverityLevel(locality)],
              fontSize: ".6rem",
            }}
            aria-label="recipe"
          >
            {trend}
          </Avatar>
        }
        action={
          <>
            <IconButton aria-label="settings" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
              id={id}
              open={!!anchorEl}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <MenuItem href="https://fiipregatit.ro" target="_blank">
                <ListItemIcon>
                  <Rule fontSize="small" />
                </ListItemIcon>
                <ListItemText>Vezi restricții</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => router.push(`/localities/${locality.siruta}`)}
              >
                <ListItemIcon>
                  <Launch fontSize="small" />
                </ListItemIcon>
                <ListItemText>Deschide</ListItemText>
              </MenuItem>
              {!trackedLocalities.includes(locality.siruta) ? (
                <MenuItem onClick={trackLocality}>
                  <ListItemIcon>
                    <BookmarkAddOutlined fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Abonează-te</ListItemText>
                </MenuItem>
              ) : (
                <MenuItem onClick={untrackLocality}>
                  <ListItemIcon>
                    <BookmarkRemoveOutlined fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Dezabonează-te</ListItemText>
                </MenuItem>
              )}
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Share fontSize="small" />
                </ListItemIcon>
                <ListItemText>Distribuie</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Code fontSize="small" />
                </ListItemIcon>
                <ListItemText>Embed</ListItemText>
              </MenuItem>
            </Menu>
          </>
        }
        title={<a href={`/localities/${locality.siruta}`}>{locality.uat}</a>}
        subheader={
          <a href={`/localities/${locality.siruta}`}>{locality.county}</a>
        }
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
          Rată de incidență {number.toFixed(2)}‰
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
        {!trackedLocalities.includes(locality.siruta) ? (
          <Tooltip
            title={`Abonează-te la "${locality.uat}, jud. ${locality.county}"`}
          >
            <IconButton onClick={trackLocality}>
              <BookmarkAddOutlined />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={`Dezabonează-te`}>
            <IconButton onClick={untrackLocality}>
              <BookmarkRemoveOutlined />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={`Vezi restricții`}>
          <IconButton href="https://fiipregatit.ro" target="_blank">
            <Rule />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Deschide`}>
          <IconButton
            sx={{ ml: "auto" }}
            href={`/localities/${locality.siruta}`}
          >
            <Launch />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
