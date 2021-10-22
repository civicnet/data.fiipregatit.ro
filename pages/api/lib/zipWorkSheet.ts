import XLSX from "xlsx";

export function zipWorkSheet(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  const rawData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

  const header = rawData[0];
  if (typeof header !== "object" || header === null) {
    throw new Error("Unexpected worksheet format");
  }

  const keys = Object.values(header);
  const rfmt = [];
  for (const item of rawData.slice(1)) {
    const zipped = Object.values(item).reduce((acc, v, idx) => {
      return {
        ...(acc as Record<string, unknown>),
        [keys[idx] as string]: v,
      };
    }, {}) as Record<string, unknown> & { UAT: string; Judet: string };

    rfmt.push(zipped);
  }

  return rfmt;
}