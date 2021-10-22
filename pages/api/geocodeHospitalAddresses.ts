// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { UATS_URL } from "../../lib/constants";
import { booleanContains, feature, Feature, point } from "@turf/turf";
import { fetchLatestWorkbook } from "./lib/fetchLatestWorkbook";
import { zipWorkSheet } from "./lib/zipWorkSheet";
import { oneLineTrim } from "common-tags";
import inpatients from "../../data/inpatients.json";
import icu from "../../data/icu.json";
import { Hospital } from "./hospitals";

type ErrorResponse = { error: boolean; msg?: string; data?: unknown };

let uatFeatures: Feature[] = [];
type HospitalQueryType = "inpatient" | "icu";

let limit = 0;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, unknown>[] | ErrorResponse>
) {
  const { type } = req.query;
  if (typeof type !== "string" || !["inpatient", "icu"].includes(type)) {
    return res.status(500).json({
      error: true,
      msg: `Wrong "type" received: ${JSON.stringify(type)}`,
    });
  }

  const workbook = await fetchLatestWorkbook();
  const sheetName =
    type === "inpatient" ? "persoane_spital" : "persoane_spital_ati";

  const sheet = workbook.Sheets[sheetName];
  const data = zipWorkSheet(sheet);

  if (!uatFeatures.length) {
    const uatResponse = await fetch(UATS_URL);
    uatFeatures = await uatResponse.json();
  }

  const augment = async (
    row: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const matches = (
      h: typeof icu[0] | typeof inpatients[0],
      row: Record<string, unknown>
    ): boolean => {
      return h.hospital === row["Spital"] && h.county === row["Judet"];
    };

    const existing =
      type === "inpatient"
        ? inpatients.find((h) => matches(h, row))
        : icu.find((h) => matches(h, row));

    let potentialLocations:
      | typeof icu[0]["potentialLocations"]
      | { results: false };

    if (existing && existing.potentialLocations.results) {
      potentialLocations = existing.potentialLocations;
    } else {
      if (limit > 30) {
        potentialLocations = { results: false };
      } else {
        limit++;
        const address = encodeURIComponent(
          `${row["Spital"]}, ${row["Judet"]}, Romania`
        );

        const response = await fetch(oneLineTrim`
          https://maps.googleapis.com/maps/api/geocode/json
          ?address=${address}
          &key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
        `);

        potentialLocations = await response.json();
      }
    }

    const locality = uatFeatures.find((uat) => {
      const candidates = potentialLocations.results;
      if (!candidates || !candidates.length) {
        return false;
      }

      const { location } = candidates[0].geometry;

      if (uat.geometry.type === "Polygon") {
        return booleanContains(uat, point([location.lng, location.lat]));
      } else if (uat.geometry.type === "MultiPolygon") {
        for (const coordinates of (uat.geometry as any).coordinates) {
          try {
            const contains = booleanContains(
              feature({ type: "Polygon", coordinates }),
              point([location.lng, location.lat])
            );

            if (contains) {
              return contains;
            }
          } catch (e) {
            console.log("Failed geo for", coordinates);
          }
        }
      }

      return false;
    });

    return {
      hospital: row["Spital"],
      county: row["Judet"],
      locality,
      potentialLocations,
      data: Object.entries(row).reduce((acc, [k, v]) => {
        if (k === "Spital" || k === "Judet") {
          return acc;
        }

        return {
          ...acc,
          [k]: v,
        };
      }, {}),
    };
  };

  const result = await Promise.all(data.map((d) => augment(d)));

  res.status(200).json(result);
}
