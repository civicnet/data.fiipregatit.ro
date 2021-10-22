import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { SeverityLevel } from "../lib/SeverityLevel";
import { SeverityLevelColor } from "../lib/SeverityLevelColor";
import { SeverityLevelDescription } from "../lib/SeverityLevelDescription";

type Props = {
  lastUpdatedAt: number;
};

export default function FeatureMapLegend({ lastUpdatedAt }: Props) {
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
        </ListItem>
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
                primary={SeverityLevelDescription.incidence[k as SeverityLevel]}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
