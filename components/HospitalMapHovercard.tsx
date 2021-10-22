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
import React from "react";
import { getNewestData } from "../lib/getNewestData";
import { Hospital } from "../pages/api/hospitals";
import { HoverInfo, HoverInfoCounty, HoverInfoUAT } from "./CovidMap";

export default function FeatureMapHovercard(hoverInfo: HoverInfo<Hospital>) {
  const inpatient = getNewestData(hoverInfo.object.data.inpatient);
  const icu = getNewestData(hoverInfo.object.data.icu);

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
              secondary={typeof inpatient === "string" ? 0 : Number(inpatient)}
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
              secondary={typeof icu === "string" ? 0 : Number(icu)}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
