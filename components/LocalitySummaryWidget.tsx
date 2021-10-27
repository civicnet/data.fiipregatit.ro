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
import { LocalityWithFeatureAndHospitals } from "../types/Locality";
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
  BookmarkRemoveOutlined,
  Code,
  Launch,
  PinDrop,
  PinRounded,
  PinTwoTone,
  Room,
  Rule,
  Share,
  TrendingDown,
  TrendingFlat,
  TrendingUp,
} from "@mui/icons-material";
import { useRecoilState } from "recoil";
import { trackedLocalitiesState } from "../store/trackedLocalitiesState";
import { useRouter } from "next/router";
import { getNewestNonStaleData } from "../lib/getNewestNonStaleData";
import { Hospital } from "../pages/api/hospitals";
import TrendArrow from "./TrendArrow";
import { Trend } from "../pages/api/byTrend";

type Props = {
  style?: React.CSSProperties;
  locality: LocalityWithFeatureAndHospitals;
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

  const untrackLocality = () => {
    if (!locality || !trackedLocalities.includes(locality.siruta)) {
      return;
    }

    setTrackedLocalities(
      trackedLocalities.filter((l) => l !== locality.siruta)
    );
  };

  const hospitalTooltipReducer =
    (list: unknown[]) => (acc: string, h: any, idx: number) => {
      if (idx == 2) {
        const remaining = list.length - 3;
        return `${acc} și alte ${remaining} spitale.`;
      }

      if (idx > 2) {
        return acc;
      }

      return `${acc}${!!acc.length ? `,` : ""} ${h.name}`;
    };

  const hospitalPeopleCounter = (acc: number, h: any) => {
    const newest = getNewestNonStaleData(h.data);
    if (!newest) {
      return acc;
    }
    return acc + newest[1];
  };

  return (
    <Card variant="outlined" {...rest}>
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
        <List dense={true}>
          <ListItem>
            {!!locality.inpatient.length && (
              <Tooltip
                title={locality.inpatient.reduce(
                  hospitalTooltipReducer(locality.inpatient),
                  ""
                )}
              >
                <ListItemText
                  primary="Spitalizați"
                  secondary={locality.inpatient.reduce(
                    hospitalPeopleCounter,
                    0
                  )}
                />
              </Tooltip>
            )}

            {!!locality.icu.length && (
              <Tooltip
                title={locality.icu.reduce(
                  hospitalTooltipReducer(locality.icu),
                  ""
                )}
              >
                <ListItemText
                  primary="Internați la ATI"
                  secondary={locality.icu.reduce(hospitalPeopleCounter, 0)}
                />
              </Tooltip>
            )}

            {!locality.icu.length && !locality.inpatient.length && (
              <ListItemText
                secondary={`Nu există spitale cu bolnavi COVID în ${locality.uat}`}
              />
            )}
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
