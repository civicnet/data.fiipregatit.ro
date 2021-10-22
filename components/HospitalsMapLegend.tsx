import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { SeverityLevel } from "../lib/SeverityLevel";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";

type Props = {
  lastUpdatedAt: number;
  limits: Record<SeverityLevel, [number, number]>;
  onFiltered: (level: SeverityLevel) => void;
  filtered: SeverityLevel[];
};

export default function FeatureMapLegend({
  lastUpdatedAt,
  limits,
  onFiltered,
  filtered,
}: Props) {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        position: "absolute",
        top: theme.spacing(2),
        left: theme.spacing(2),
        zIndex: 10,
      }}
    >
      <List dense={true} disablePadding sx={{ mt: 0 }}>
        <ListItem sx={{ pl: 0 }}>
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
        </ListItem>
        <Divider />
        <ListItem sx={{ pl: 0, pb: 2 }}>
          <ListItemText primary="Persoane spitalizate la ATI" />
        </ListItem>
        {Object.entries(SeverityLevelColor.scatterplot).map(([k, v]) => {
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
                  k === SeverityLevel.NONE
                    ? "zero persoane"
                    : `între ${limits[k as SeverityLevel][0]} și ${
                        limits[k as SeverityLevel][1]
                      } persoane`
                }
              />
              <ListItemSecondaryAction sx={{ right: 0 }}>
                <Switch
                  defaultChecked={filtered.includes(k as SeverityLevel)}
                  size="small"
                  onChange={() => onFiltered(k as SeverityLevel)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
