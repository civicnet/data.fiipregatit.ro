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
      <link rel="icon" href="/qr.png" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:300,400,500,700&display=optional"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:300,400,700|Roboto:300,400,700&display=optional"
        rel="stylesheet"
      />
      <meta name="viewport" content="initial-scale=1, width=device-width" />

      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </NextHead>
  );
}
