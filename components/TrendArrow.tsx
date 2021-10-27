import { ArrowDownward, ArrowRight, ArrowUpward } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";
import { Trend } from "../pages/api/byTrend";

type Props = {
  trend: Trend;
};

export default function TrendArrow({ trend }: Props) {
  let trendArrow = (
    <Tooltip title="Tendință descrescătoare">
      <ArrowDownward />
    </Tooltip>
  );
  if (trend === Trend.FLAT) {
    trendArrow = (
      <Tooltip title="Stagnează">
        <ArrowRight />
      </Tooltip>
    );
  } else if (trend === Trend.UP) {
    trendArrow = (
      <Tooltip title="Tendință crescătoare">
        <ArrowUpward />
      </Tooltip>
    );
  }

  return trendArrow;
}
