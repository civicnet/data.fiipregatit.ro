import React from "react";
import NextHead from "next/head";

type HeadProps = {
  title?: string;
  description?: string;
};

export function Head({
  title = "data.fiipregătit.ro",
  description = "",
}: HeadProps) {
  return (
    <NextHead>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Merriweather:300,400,700|Roboto:300,400,700"
        rel="stylesheet"
      />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </NextHead>
  );
}
