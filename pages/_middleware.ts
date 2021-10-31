import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { nextUrl: url, geo } = req;

  url.searchParams.set("_geo", JSON.stringify(geo));

  return NextResponse.rewrite(url);
}
