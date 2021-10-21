import { Card, CardHeader, Skeleton, CardContent } from "@mui/material";
import React from "react";

export default function SkeletonCard() {
  return (
    <Card sx={{ maxWidth: 345, m: 2 }} style={{ margin: "0 auto" }}>
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
            width="80%"
            style={{ marginBottom: 6 }}
          />
        }
        subheader={<Skeleton animation="wave" height={10} width="40%" />}
      />
      {<Skeleton sx={{ height: 190 }} animation="wave" variant="rectangular" />}
      <CardContent>
        {
          <React.Fragment>
            <Skeleton
              animation="wave"
              height={10}
              style={{ marginBottom: 6 }}
            />
            <Skeleton animation="wave" height={10} width="80%" />
          </React.Fragment>
        }
      </CardContent>
    </Card>
  );
}
