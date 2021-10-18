// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Fuse from "fuse.js";
import type { NextApiRequest, NextApiResponse } from "next";
import Data from "../../data/octombrie.json";
import { Locality } from "../../types/Locality";

type Error = { error: boolean };
type Result = {
  data: Fuse.FuseResult<Locality>[];
  info: {
    total: number;
  };
};

function removeAccents<T>(obj: T): T | string {
  if (typeof obj === "string" || obj instanceof String) {
    return obj.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  return obj;
}

function getFn<T>(obj: T, path: string | string[]): string | readonly string[] {
  const value = (Fuse as any).config.getFn(obj, path);
  if (Array.isArray(value)) {
    return value.map((el) => removeAccents(el));
  }
  return removeAccents(value);
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result | Error>
) {
  const { query } = req;

  const q = query["q"];
  if (typeof q !== "string") {
    return res.status(500).json({ error: true });
  }

  const options = {
    includeScore: true,
    keys: ["uat", "county"],
    isCaseSensitive: false,
    ignoreLocation: false,
    ignoreFieldNorm: false,
    getFn,
  };

  const fuse = new Fuse(Data, options);
  const result = fuse.search(q);

  res.status(200).json({
    data: result.slice(
      0,
      query["limit"] ? Number(query["limit"]) : result.length
    ),
    info: {
      total: result.length,
    },
  });
}
