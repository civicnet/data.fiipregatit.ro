import { Link, Typography } from "@mui/material";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

type Props = {
  children: string;
};

export default function MarkdownContent({ children }: Props) {
  return (
    <Typography>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          h1: ({ node, ...props }) => (
            <Typography variant="h1" key={props.key} />
          ),
          h2: ({ node, ...props }) => (
            <Typography variant="h2" key={props.key} />
          ),
          h3: ({ node, ...props }) => (
            <Typography variant="h3" key={props.key} />
          ),
          h4: ({ node, ...props }) => (
            <Typography variant="h4" key={props.key} />
          ),
          h5: ({ node, ...props }) => (
            <Typography variant="h5" key={props.key} />
          ),
          h6: ({ node, ...props }) => (
            <Typography variant="h6" key={props.key} />
          ),
          a: ({ ...props }: any) => <Link {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </Typography>
  );
}
