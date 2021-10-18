// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Fuse from "fuse.js";
import type { NextApiRequest, NextApiResponse } from "next";
import Data from "../../data/octombrie.json";
import { UATS_URL } from "../../lib/constants";
import { Locality } from "../../types/Locality";
import * as turf from "@turf/turf";

type Error = { error: boolean };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Locality | Error>
) {
  const { lat, lng } = req.query;

  const uats = await fetch(UATS_URL);
  const json = await uats.json();

  for (const locality of json) {
    if (locality.geometry.type !== "Polygon") {
      continue;
    }

    if (
      turf.booleanContains(locality, turf.point([Number(lng), Number(lat)]))
    ) {
      return res.status(200).json(locality);
    }
  }

  return res.status(500).json({ error: true });
}
