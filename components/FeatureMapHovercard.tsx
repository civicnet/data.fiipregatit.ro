import { AirlineSeatFlatOutlined, CoronavirusOutlined, HealthAndSafetyOutlined, Room } from "@mui/icons-material";
import {
  Card,
  CardHeader,
  Avatar,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import React from "react";
import { HoverInfo, HoverInfoCounty, HoverInfoUAT } from "./CovidMap";

export default function FeatureMapHovercard(
  hoverInfo?: HoverInfo<HoverInfoCounty | HoverInfoUAT>
) {
  if (!hoverInfo?.object) {
    return null;
  }

  return (
    <Card
      style={{
        position: "absolute",
        zIndex: 1,
        pointerEvents: "none",
        width: 250,
      }}
    >
      <CardHeader
        avatar={
          <Avatar>
            <Room />
          </Avatar>
        }
        title={hoverInfo.object.properties.name}
        subheader={
          "county" in hoverInfo.object.properties
            ? hoverInfo.object.properties.county
            : ""
        }
      />
      <CardContent>
        <List disablePadding dense>
          <ListItem alignItems="flex-start" disablePadding>
            <ListItemAvatar>
              <Avatar>
                <CoronavirusOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Rata de infectare (incidența)"
              secondary={`${hoverInfo.object.properties.rate.toFixed(2)}‰`}
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem alignItems="flex-start" disablePadding>
            <ListItemAvatar>
              <Avatar>
                <HealthAndSafetyOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Rata de vaccinare" secondary="35%" />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem alignItems="flex-start" disablePadding>
            <ListItemAvatar>
              <Avatar>
                <AirlineSeatFlatOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Paturi ATI disponibile" secondary={1} />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
