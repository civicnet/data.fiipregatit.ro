import {
  faMapPin,
  faHeadSideCough,
  faSyringe,
  faBed,
  faHospitalAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { getNewestData } from "../lib/getNewestData";
import { getNewestNonStaleData } from "../lib/getNewestNonStaleData";
import { Hospital } from "../pages/api/hospitals";
import { HoverInfo, HoverInfoCounty, HoverInfoUAT } from "./CovidMap";

export default function FeatureMapHovercard(hoverInfo: HoverInfo<Hospital>) {
  const inpatient = useMemo(() => getNewestNonStaleData(hoverInfo.object.data.inpatient), [hoverInfo]);
  const icu = useMemo(() => getNewestNonStaleData(hoverInfo.object.data.icu), [hoverInfo]);
  
  return (
    <Card
      style={{
        position: "absolute",
        zIndex: 1,
        pointerEvents: "none",
        left: hoverInfo.x,
        top: hoverInfo.y,
        width: 350,
      }}
    >
      <CardHeader
        avatar={
          <Avatar>
            <FontAwesomeIcon icon={faHospitalAlt} />
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
                <FontAwesomeIcon icon={faHeadSideCough} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Număr de persoane spitalizate"
              secondary={inpatient && inpatient[1] || 0}
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem alignItems="flex-start" disablePadding>
            <ListItemAvatar>
              <Avatar>
                <FontAwesomeIcon icon={faSyringe} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Număr de persoane internate la ATI"
              secondary={icu && icu[1] || 0}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
