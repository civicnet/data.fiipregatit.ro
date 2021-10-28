import {
  AirlineSeatFlatOutlined,
  HealthAndSafetyOutlined,
  Room,
} from "@mui/icons-material";
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
import React, { useMemo } from "react";
import { getNewestNonStaleData } from "../lib/getNewestNonStaleData";
import { Hospital } from "../pages/api/hospitals";
import { HoverInfo } from "./CovidMap";

export default function FeatureMapHovercard(hoverInfo?: HoverInfo<Hospital>) {
  if (!hoverInfo?.object) {
    return null;
  }

  const inpatient = useMemo(
    () => getNewestNonStaleData(hoverInfo.object.data.inpatient),
    [hoverInfo]
  );
  const icu = useMemo(
    () => getNewestNonStaleData(hoverInfo.object.data.icu),
    [hoverInfo]
  );

  return (
    <Card
      style={{
        position: "absolute",
        zIndex: 1,
        pointerEvents: "none",
        width: 350,
      }}
    >
      <CardHeader
        avatar={
          <Avatar>
            <Room />
          </Avatar>
        }
        title={hoverInfo.object.name}
        subheader={hoverInfo.object.address}
      />
      <CardContent>
        <List disablePadding dense>
          <ListItem alignItems="flex-start" disablePadding>
            <ListItemAvatar>
              <Avatar>
                <HealthAndSafetyOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Număr de persoane spitalizate"
              secondary={(inpatient && inpatient[1]) || 0}
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem alignItems="flex-start" disablePadding>
            <ListItemAvatar>
              <Avatar>
                <AirlineSeatFlatOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Număr de persoane internate la ATI"
              secondary={(icu && icu[1]) || 0}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
