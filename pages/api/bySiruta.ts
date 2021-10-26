// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Feature } from "@turf/turf";
import type { NextApiRequest, NextApiResponse } from "next";
import Data from "../../data/octombrie.json";
import { UATS_URL, COUNTIES_URL } from "../../lib/constants";
import { fetchLocalityBySiruta } from "../../server/fetchLocalityBySiruta";
import { LocalityWithFeatureAndHospitals } from "../../types/Locality";

type ErrorResponse = { error: boolean };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocalityWithFeatureAndHospitals | ErrorResponse>
) {
  const { query } = req;

  const code = query["code"];
  if (typeof code !== "string") {
    return res.status(500).json({ error: true });
  }

  const match = await fetchLocalityBySiruta(code);
  return res.status(200).json(match);
}
