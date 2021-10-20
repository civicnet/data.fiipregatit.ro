// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Data from "../../data/octombrie.json";
import { COUNTIES_URL, UATS_URL } from "../../lib/constants";
import { getNewestLocalityData } from "../../lib/getNewestLocalityData";
import { Feature, Geometry, GeometryCollection } from "@turf/turf";

type ErrorResponse = { error: boolean };

let uatFeatures: Feature[] = [];
let countyFeatures: Feature[] = [];

type UATProperties = {
  name: string;
  siruta: string;
  county: string;
  rate: number;
};

type CountyProperties = {
  name: string;
  rate: number;
};

export type Layers = {
  uats: Feature<Geometry | GeometryCollection, UATProperties>[];
  counties: Feature<Geometry | GeometryCollection, CountyProperties>[];
  uatRange: [number, number];
  countyRange: [number, number];
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Layers | ErrorResponse>
) {

  const { county, siruta } = req.query;

  if (county && siruta) {
    return res.status(500).json({ error: true });
  }

  if (!uatFeatures.length || !countyFeatures.length) {
    const [uatResponse, countyResponse] = await Promise.all([
      fetch(UATS_URL),
      fetch(COUNTIES_URL),
    ]);

    [uatFeatures, countyFeatures] = await Promise.all([
      uatResponse.json(),
      countyResponse.json(),
    ]);
  }

  let uats: Layers["uats"] = [];
  let minUat;
  let maxUat;
  for (const feature of uatFeatures) {
    if (siruta && feature.properties?.natcode !== siruta) {
      continue;
    }

    if (county && feature.properties?.county !== county) {
      continue;
    }

    const data = Data.find((d) => d.siruta === feature.properties?.natcode);
    if (!data) {
      continue;
    }

    const rate = getNewestLocalityData(data) || 0;
    if (!minUat || rate < minUat) {
      minUat = rate;
    }

    if (!maxUat || rate > maxUat) {
      maxUat = rate;
    }

    uats.push({
      ...feature,
      properties: {
        name: data.uat,
        siruta: data.siruta,
        county: data.county,
        rate,
      },
    });
  }

  let counties: Layers["counties"] = [];
  let minCounty;
  let maxCounty;
  for (const feature of countyFeatures) {
    if (county && feature.properties?.name !== county) {
      continue;
    }

    const data = Data.filter((d) => d.county === feature.properties?.name);
    if (!data.length) {
      continue;
    }

    const rate =
      data.reduce((acc, d) => {
        return acc + (getNewestLocalityData(d) || 0);
      }, 0) / data.length;

    if (!minCounty || rate < minCounty) {
      minCounty = rate;
    }

    if (!maxCounty || rate > maxCounty) {
      maxCounty = rate;
    }

    counties.push({
      ...feature,
      properties: {
        name: feature.properties?.name,
        rate,
      },
    });
  }

  return res.status(200).json({
    uats,
    counties,
    uatRange: [minUat || 0, maxUat || 0],
    countyRange: [minCounty || 0, maxCounty || 0],
  });
}
