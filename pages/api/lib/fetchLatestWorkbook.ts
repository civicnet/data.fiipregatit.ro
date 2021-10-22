import XLSX from "xlsx";
import nodeFetch from "node-fetch";
import https from "https";

export async function fetchLatestWorkbook(): Promise<XLSX.WorkBook> {
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
    throw new Error("Unable to fetch data from data.gov.ro API");
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

  return XLSX.read(body);
}
