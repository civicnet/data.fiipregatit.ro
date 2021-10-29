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
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
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
  BookmarkAddOutlined,
  BookmarkRemoveOutlined,
  Code,
  ExpandLess,
  ExpandMore,
  Launch,
  Room,
  Rule,
  Share,
} from "@mui/icons-material";
import { useRecoilState } from "recoil";
import { trackedLocalitiesState } from "../store/trackedLocalitiesState";
import { useRouter } from "next/router";
import { getNewestNonStaleData } from "../lib/getNewestNonStaleData";
import TrendArrow from "./TrendArrow";
import { Trend } from "../pages/api/byTrend";

type Props = {
  style?: React.CSSProperties;
  locality: LocalityWithFeatureAndHospitals;
};

export default function LocalityExpandedSummaryWidget({
  locality,
  ...rest
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [trackedLocalities, setTrackedLocalities] = useRecoilState(
    trackedLocalitiesState
  );

  const [hospitalListOpen, setHospitalListOpen] = React.useState(false);

  const toggleHospitalList = () => {
    setHospitalListOpen(!hospitalListOpen);
  };

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

  const populationCount =
    locality.features.uat.properties &&
    locality.features.uat.properties["pop2015"];

  const formatNumber = (n: number): string => {
    return new Intl.NumberFormat("ro-RO", {}).format(
      Number.isInteger(n) ? n : Number(n.toFixed(2))
    );
  };

  let allHospitals: {
    name: string;
    icu?: [string, number];
    inpatient?: [string, number];
  }[] = [];

  for (const icu of locality.icu) {
    allHospitals.push({
      name: icu.name,
      icu: getNewestNonStaleData(icu.data),
    });
  }

  for (const inpatient of locality.inpatient) {
    const exists = allHospitals.find((h) => h.name === inpatient.name);
    if (exists) {
      allHospitals = allHospitals.filter((ah) => ah.name !== inpatient.name);
      allHospitals.push({
        name: inpatient.name,
        icu: exists.icu,
        inpatient: getNewestNonStaleData(inpatient.data),
      });
    } else {
      allHospitals.push({
        name: inpatient.name,
        inpatient: getNewestNonStaleData(inpatient.data),
      });
    }
  }

  allHospitals = allHospitals.sort((a, b) => {
    const sum = (h: typeof a | typeof b): number => {
      return (
        Number(h.icu ? h.icu[1] : 0) + Number(h.inpatient ? h.inpatient[1] : 0)
      );
    };
    return sum(b) - sum(a);
  });

  const previewHospitals = allHospitals.slice(0, 3);
  const restHospitals = allHospitals.slice(3);

  const getHospitalListing = (
    h: typeof allHospitals[0],
    opts: { includeDivider: boolean }
  ) => {
    return (
      <>
        <ListItem>
          <ListItemText
            primary={h.name}
            secondary={
              <Box sx={{ display: "flex" }}>
                <Tooltip
                  title={
                    h.inpatient ? `Ultima actualizare: ${h.inpatient[0]}` : ""
                  }
                >
                  <ListItemText
                    primary="Internați"
                    secondary={h.inpatient ? h.inpatient[1] : "Neactualizat"}
                  />
                </Tooltip>
                <Tooltip title={h.icu ? `Ultima actualizare: ${h.icu[0]}` : ""}>
                  <ListItemText
                    primary="ATI"
                    secondary={h.icu ? h.icu[1] : "Neactualizat"}
                  />
                </Tooltip>
              </Box>
            }
          />
        </ListItem>
        {opts.includeDivider && <Divider />}
      </>
    );
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
            <ListItemText
              primary="Populație rezidentă (2015)"
              secondary={
                populationCount ? formatNumber(populationCount) : "Neactualizat"
              }
            />
          </ListItem>
        </List>
        <List dense={true}>
          {previewHospitals.map((h, idx) =>
            getHospitalListing(h, {
              includeDivider: idx < previewHospitals.length - 1,
            })
          )}
          <Collapse in={hospitalListOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense={true}>
              {restHospitals.map((h, idx) =>
                getHospitalListing(h, {
                  includeDivider: idx < restHospitals.length - 1,
                })
              )}
            </List>
          </Collapse>
          {restHospitals.length > 0 && (
            <ListItemButton onClick={toggleHospitalList}>
              <ListItemText primary={hospitalListOpen ? "Afișează mai puține" : "Afișează mai multe"} />
              {hospitalListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          )}
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
      </CardActions>
    </Card>
  );
}
