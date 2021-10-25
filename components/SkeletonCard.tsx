import {
  Card,
  CardHeader,
  Skeleton,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CardActions,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/system";
import React, { CSSProperties } from "react";

type Props = {
  width?: number | string;
  style?: CSSProperties;
};

export default function SkeletonCard(props: Props) {
  const theme = useTheme();

  return (
    <Card variant="outlined" {...props}>
      <CardHeader
        avatar={
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
          />
        }
        title={
          <Skeleton
            animation="wave"
            height={10}
            width="60%"
            style={{ marginBottom: 6 }}
          />
        }
        subheader={<Skeleton animation="wave" height={10} width="30%" />}
      />
      {<Skeleton sx={{ height: 100 }} animation="wave" variant="rectangular" />}
      <CardContent>
        <List dense={true}>
          <ListItem>
            <ListItemText
              primary={<Skeleton animation="wave" width="70%" />}
              secondary={<Skeleton animation="wave" width="2rem" />}
            />
            <ListItemText
              primary={<Skeleton animation="wave" width="50%" />}
              secondary={<Skeleton animation="wave" width="2rem" />}
            />
          </ListItem>
        </List>
      </CardContent>
      <CardActions disableSpacing sx={{ pt: theme.spacing(0.5) }}>
        <IconButton disabled>
          <Skeleton animation="wave" width={30} />
        </IconButton>
        <IconButton disabled>
          <Skeleton animation="wave" width={30} />
        </IconButton>
        <IconButton disabled sx={{ ml: "auto" }}>
          <Skeleton animation="wave" width={30} />
        </IconButton>
      </CardActions>
    </Card>
  );
}
