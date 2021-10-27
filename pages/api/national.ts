import type { NextApiRequest, NextApiResponse } from "next";
import {
  fetchNationalSummary,
  NationalSummary,
} from "../../server/fetchNationalSummary";

type ErrorResponse = { error: boolean };

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Partial<NationalSummary> | ErrorResponse>
) {
  const summary = await fetchNationalSummary();
  return res.status(200).json(summary);
}
