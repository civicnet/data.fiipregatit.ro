// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { UATS_URL } from "../../lib/constants";
import { Feature } from "@turf/turf";
import XLSX from "xlsx";
import nodeFetch from "node-fetch";
import { fetchLatestWorkbook } from "./lib/fetchLatestWorkbook";

type ErrorResponse = { error: boolean; msg?: string; data?: unknown };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, unknown>[] | ErrorResponse>
) {
  const workbook = await fetchLatestWorkbook();
  const sheet = workbook.Sheets["incidenta"];

  // TODO: use zipWorkSheet
  const rawData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
  const header = rawData[0];
  if (typeof header !== "object" || header === null) {
    return res.status(500).json({
      error: true,
      msg: "Unexpected worksheet format",
      data: rawData,
    });
  }

  const keys = Object.values(header);
  const output = [];
  const unmatched = [];
  const uats = await nodeFetch(UATS_URL);
  const uatsJSON = (await uats.json()) as Feature[];

  const stripDiacritics = (a: string) =>
    a.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const compare = (a: string, b: string) =>
    stripDiacritics(a).replaceAll("-", " ").toLowerCase() ===
    stripDiacritics(b).replaceAll("-", " ").toLowerCase();

  for (const item of rawData.slice(1)) {
    const zipped = Object.values(item).reduce((acc, v, idx) => {
      return {
        ...(acc as Record<string, unknown>),
        [keys[idx] as string]: v,
      };
    }, {}) as Record<string, unknown> & { UAT: string; Judet: string };

    const match = uatsJSON.find((u) => {
      // different naming strategies...
      const needle = zipped.UAT.replace("SECTOR ", "BUCUREȘTI SECTORUL ")
        .replace("MUNICIPIUL ", "")
        .replace("ORAŞ ", "");

      const firstPass = compare(u.properties?.name, needle);
      if (firstPass) {
        if (
          compare(u.properties?.county, zipped.Judet.replace("MUNICIPIUL ", ""))
        ) {
          return true;
        }
      }

      // Still fails for "câmpie", ie: "sânpetru de câmpie"
      const secondPass = compare(u.properties?.name, needle.replace("Â", "Î"));
      if (secondPass) {
        if (
          compare(u.properties?.county, zipped.Judet.replace("MUNICIPIUL ", ""))
        ) {
          return true;
        }
      }

      return false;
    });

    if (!match) {
      unmatched.push(zipped);
      continue;
    }

    output.push({
      uat: match.properties?.name,
      county: match.properties?.county,
      siruta: match.properties?.natcode,
      data: {
        ...Object.entries(zipped).reduce((acc, [k, v]) => {
          if (k !== "UAT" && k !== "Judet") {
            return {
              ...acc,
              [k]: v,
            };
          }

          return acc;
        }, {}),
      },
    });
  }

  return res.status(200).json(output);
}
