import { useTheme } from "@mui/material";
import { PatternCircles } from "@visx/pattern";
import { ParentSize } from "@visx/responsive";
import Bar from "@visx/shape/lib/shapes/Bar";
import { nanoid } from "nanoid";
import React, { JSXElementConstructor, ReactElement } from "react";

type Props = {
  children?: JSXElementConstructor<any> | ReactElement;
};

export default function CirclesPattern({ children }: Props) {
  const id = "circle-pattern";
  const theme = useTheme();

  return (
    <ParentSize>
      {(parent) => (
        <svg width={parent.width} height={parent.height}>
          <PatternCircles
            id={id}
            height={8}
            width={8}
            radius={1.5}
            fill="#dedede"
            complement
          />
          <Bar
            fill={`url(#${id})`}
            x={0}
            y={0}
            width={parent.width}
            height={parent.height}
          />
          {children}
        </svg>
      )}
    </ParentSize>
  );
}
