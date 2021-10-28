import {
  Avatar,
  Collapse,
  Divider,
  IconButton,
  IconButtonProps,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { SeverityLevel } from "../lib/SeverityLevel";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { SeverityLevelDescription } from "../lib/SeverityLevelDescription";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Props = {
  lastUpdatedAt: number;
};

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function FeatureMapLegend({ lastUpdatedAt }: Props) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const theme = useTheme();
  return (
    <Paper sx={{ p: 2 }}>
      <List dense={true} disablePadding sx={{ mt: 0, width: 170 }}>
        <ListItem disablePadding>
          <ListItemText
            primary={
              <Typography sx={{ fontWeight: "bold" }}>Legendă</Typography>
            }
            secondary={`
              ${new Date(lastUpdatedAt).toLocaleDateString("ro-RO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            `}
          />
          <ListItemSecondaryAction sx={{ right: 0 }}>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </ListItemSecondaryAction>
        </ListItem>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          {Object.entries(SeverityLevelColor.geojson).map(([k, v]) => {
            return (
              <ListItem disablePadding key={`severity-${k}`}>
                <ListItemAvatar
                  sx={{
                    minWidth: theme.spacing(3),
                  }}
                >
                  <Avatar
                    sx={{
                      background: v,
                      height: "1rem",
                      width: "1rem",
                    }}
                  >
                    {" "}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    SeverityLevelDescription.incidence[k as SeverityLevel]
                  }
                />
              </ListItem>
            );
          })}
        </Collapse>
      </List>
    </Paper>
  );
}
