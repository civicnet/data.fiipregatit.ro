import type { NextApiRequest, NextApiResponse } from "next";
import Data from "../../data/octombrie.json";
import { COUNTIES_URL, UATS_URL } from "../../lib/constants";
import { LocalityWithFeature } from "../../types/Locality";
import { getNewestLocalityData } from "../../lib/getNewestLocalityData";
import { Feature } from "@turf/turf";

type ErrorResponse = { error: boolean };

export enum ByIncidenceOrder {
  LOW_TO_HIGH = "LOW_TO_HIGH",
  HIGH_TO_LOW = "HIGH_TO_LOW",
}

let uatFeatures: Feature[] = [];
let countyFeatures: Feature[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocalityWithFeature[] | ErrorResponse>
) {
  let { low, high } = req.query;

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
    const incidence = getNewestLocalityData(locality) || 0;

    if (incidence > Number(low) && incidence < Number(high)) {
      localities.push(locality);
    }
  }

  localities = localities.sort((a, b) => {
    const aNum = getNewestLocalityData(a) || 0;
    const bNum = getNewestLocalityData(b) || 0;

    return order === ByIncidenceOrder.HIGH_TO_LOW ? bNum - aNum : aNum - bNum;
  });

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

  return res.status(200).json(response);
}
