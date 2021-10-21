import type { NextApiRequest, NextApiResponse } from "next";
import Data from "../../data/octombrie.json";
import { COUNTIES_URL, UATS_URL } from "../../lib/constants";
import { LocalityWithFeature } from "../../types/Locality";
import { getNewestLocalityData } from "../../lib/getNewestLocalityData";
import { Feature } from "@turf/turf";
import { linearRegression } from "simple-statistics";
import { ByIncidenceOrder } from "./byIncidence";

type ErrorResponse = { error: boolean };

export enum Trend {
  UP = "UP",
  DOWN = "DOWN",
  FLAT = "FLAT",
}

export type ByTrendResponse = { uats: LocalityWithFeature[]; total: number };
let uatFeatures: Feature[] = [];
let countyFeatures: Feature[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ByTrendResponse | ErrorResponse>
) {
  const { trend } = req.query;

  const order = req.query.order || ByIncidenceOrder.HIGH_TO_LOW;
  const limit = Number(req.query.limit) || 10;

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

  let localities = [];
  for (const locality of Data) {
    const data = Object.entries(locality.data);
    const regression = linearRegression(
      data.map(([key, value]) => [new Date(key).valueOf(), value])
    );

    if (trend === Trend.UP && regression.b < 0) {
      localities.push(locality);
    } else if (trend === Trend.FLAT && regression.b === 0) {
      localities.push(locality);
    } else if (trend === Trend.DOWN && regression.b > 0) {
      localities.push(locality);
    }
  }

  localities = localities.sort((a, b) => {
    const aNum = getNewestLocalityData(a) || 0;
    const bNum = getNewestLocalityData(b) || 0;

    return order === ByIncidenceOrder.HIGH_TO_LOW ? bNum - aNum : aNum - bNum;
  });

  const totalCount = localities.length;
  const sliced = localities.slice(0, limit);
  const response = [];

  for (const locality of sliced) {
    const uat = uatFeatures.find(
      (f: Feature) => f.properties?.natcode === locality.siruta
    );
    const county = countyFeatures.find(
      (f: Feature) => f.properties?.name === locality.county
    );

    if (!uat) {
      throw new Error(`No UAT match for ${locality.siruta}`);
    }

    if (!county) {
      throw new Error(`No UAT match for ${locality.county}`);
    }

    response.push({
      ...locality,
      features: {
        uat,
        county,
      },
    });
  }

  return res.status(200).json({
    uats: response,
    total: totalCount,
  });
}
