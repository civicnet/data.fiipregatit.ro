// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Data from "../../data/octombrie.json";
import { COUNTIES_URL, UATS_URL } from "../../lib/constants";
import { LocalityWithFeature } from "../../types/Locality";
import { Feature } from "@turf/turf";
import { random } from "../../lib/random";
import XLSX from "xlsx";
import nodeFetch from "node-fetch";
import https from "https";

type ErrorResponse = { error: boolean; msg?: string; data?: unknown };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, unknown>[] | ErrorResponse>
) {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const dataset = await nodeFetch(
    `https://data.gov.ro/api/3/action/package_show?id=transparenta-covid`,
    {
      agent: httpsAgent,
    }
  );

  const datasetJSON = (await dataset.json()) as any;
  if (!datasetJSON.success) {
    return res.status(500).json({
      error: true,
      msg: "Unable to fetch data from data.gov.ro API",
    });
  }

  const { resources } = datasetJSON.result;
  let latestResource = resources[0];
  const updatedAt = (resource: Record<string, unknown>): number =>
    new Date(resource["last_modified"] as number).valueOf();

  for (const res of resources) {
    if (updatedAt(res) > updatedAt(latestResource)) {
      latestResource = res;
    }
  }

  const document = await nodeFetch(latestResource["datagovro_download_url"], {
    agent: httpsAgent,
  });
  const body = await document.buffer();

  const workbook = XLSX.read(body);
  const sheet = workbook.Sheets["incidenta"];

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
