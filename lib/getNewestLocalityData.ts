import { Locality } from "../types/Locality";

export const getNewestLocalityData = (
  locality: Locality
): number | undefined => {
  let latest: [string?, number?] = [undefined, undefined];
  for (const [key, value] of Object.entries(locality.data)) {
    if (!latest[0]) {
      latest = [key, Number(value)];
      continue;
    }

    if (new Date(latest[0]).valueOf() < new Date(key).valueOf()) {
      latest = [key, Number(value)];
    }
  }

  return latest[1];
};
