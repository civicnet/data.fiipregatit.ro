import { NextRequest, NextResponse } from "next/server";
import data from "../data/octombrie.json";

export async function middleware(req: NextRequest) {
  const { nextUrl: url, geo } = req;
  const locality = geo.city || "București";

  for (const uat of data) {
      if (locality === uat.uat) {
        url.searchParams.set("_geo_siruta", uat.siruta);
        url.searchParams.set("_geo_name", uat.uat);
      }
  }

  return NextResponse.rewrite(url);
}
