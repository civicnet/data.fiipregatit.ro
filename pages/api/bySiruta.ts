// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Feature } from "@turf/turf";
import Fuse from "fuse.js";
import type { NextApiRequest, NextApiResponse } from "next";
import Data from "../../data/octombrie.json";
import { UATS_URL, COUNTIES_URL } from "../../lib/constants";
import { Locality, LocalityWithFeature } from "../../types/Locality";

type ErrorResponse = { error: boolean };

let uatFeatures: Feature[] = [];
let countyFeatures: Feature[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocalityWithFeature | ErrorResponse>
) {
  const { query } = req;

  const code = query["code"];
  if (typeof code !== "string") {
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

  for (const locality of Data) {
    if (locality.siruta === code) {
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

      return res.status(200).json({
        ...locality,
        features: {
          uat,
          county,
        },
      });
    }
  }

  return res.status(500).json({ error: true });
}
