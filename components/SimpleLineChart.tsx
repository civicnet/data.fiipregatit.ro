import { DateValue } from "@visx/mock-data/lib/generators/genDateValue";
import { ParentSize } from "@visx/responsive";
import { LinePath } from "@visx/shape";
import React from "react";
import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleLinear, scaleTime } from "@visx/scale";
import { min } from "../lib/min";
import { max } from "../lib/max";

type Props = {
  series: Record<string, number>;
};

export default function SimpleLineChart({ series }: Props) {
  const getX = (d: DateValue) => d.date.valueOf();
  const getY = (d: DateValue) => d.value;

  const data: DateValue[] = Object.entries(series).map(([key, value]) => {
    return {
      date: new Date(key),
      value,
    };
  });

  // assuming monotonic
  const xScale = scaleTime<number>({
    domain: [data[0].date, data[data.length - 1].date],
  });
  const yScale = scaleLinear<number>({
    domain: [
      min(data.map((d) => d.value)) || 0,
      max(data.map((d) => d.value)) || 0,
    ],
  });

  return (
    <ParentSize>
      {(parent) => (
        <svg width={parent.width} height={parent.height}>
          <rect width={parent.width} height={parent.height} fill="#fff" />
          <Group top={0} left={0}>
            <LinePath<DateValue>
              curve={curveNatural}
              data={data}
              x={(d) => xScale.range([16, parent.width - 16])(getX(d)) ?? 0}
              y={(d) => yScale.range([parent.height - 16, 16])(getY(d)) ?? 0}
              stroke="#f99"
              strokeWidth={3}
              shapeRendering="geometricPrecision"
            />
          </Group>
        </svg>
      )}
    </ParentSize>
  );
}
