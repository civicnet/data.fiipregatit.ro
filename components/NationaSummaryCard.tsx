import {
  faHeadSideCough,
  faSyringe,
  faViruses,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Room,
  Share,
  Code,
  BookmarkAddOutlined,
  BookmarkRemoveOutlined,
  Rule,
  Launch,
  MoreVert,
} from "@mui/icons-material";
import {
  Card,
  CardHeader,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CardMedia,
  CardContent,
  Typography,
  List,
  ListItem,
  Tooltip,
  CardActions,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { id } from "common-tags";
import React from "react";
import { SeverityLevel } from "../lib/SeverityLevel";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { Trend } from "../pages/api/byTrend";
import SimpleLineChart from "./SimpleLineChart";
import TrendArrow from "./TrendArrow";

type Props = {
  main: string;
  title: string;
  trend: Trend;
  series: Record<string, number>;
  data: {
    main: string;
    subtext: string;
  }[];
};

export default function NationalSummaryCard({
  main,
  title,
  trend,
  series,
  data,
  ...rest
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const theme = useTheme();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const id = !!anchorEl ? "simple-popover" : undefined;

  return (
    <Card variant="outlined" {...rest}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe">
            <Room />
          </Avatar>
        }
        action={
          <>
            <IconButton aria-label="settings" onClick={handleMenuOpen}>
              <MoreVert />
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
        title={title}
        subheader="România"
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
            series={series}
            color={SeverityLevelColor.geojson[SeverityLevel.NONE]}
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
            
            <TrendArrow trend={trend} />
            <Typography
              variant="h4"
              sx={{
                fontFamily: "Roboto, sans-serif",
              }}
            >
              {main}
            </Typography>
          </Box>
        </Box>
        <List dense={true}>
          <ListItem>
            {data.map((d, idx) => {
              return <ListItemText primary={d.subtext} secondary={d.main} key={`list-item-${idx}`}/>;
            })}
          </ListItem>
        </List>
      </CardContent>
      <CardActions disableSpacing>
        <Tooltip title={`Vezi restricții`}>
          <IconButton href="https://fiipregatit.ro" target="_blank">
            <Rule />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Deschide`}>
          <IconButton sx={{ ml: "auto" }}>
            <Launch />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
