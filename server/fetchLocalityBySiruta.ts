import { Feature } from "@turf/turf";
import october from "../data/octombrie.json";
import { UATS_URL, COUNTIES_URL } from "../lib/constants";
import { LocalityWithFeature } from "../types/Locality";

export async function fetchLocalityBySiruta(
  code: string
): Promise<LocalityWithFeature> {
  const [uatResponse, countyResponse] = await Promise.all([
    fetch(UATS_URL),
    fetch(COUNTIES_URL),
  ]);

  const [uatFeatures, countyFeatures] = await Promise.all([
    uatResponse.json(),
    countyResponse.json(),
  ]);

  for (const locality of october) {
    if (locality.siruta === code) {
      const uat = uatFeatures.find(
        (f: Feature) => f.properties?.natcode === locality.siruta
      );
      const county = countyFeatures.find(
        (f: Feature) => f.properties?.name === locality.county
      );

      if (!uat) {
        throw new Error(`No uat feature match for ${locality.siruta}`);
      }

      if (!county) {
        throw new Error(`No county feature match for ${locality.county}`);
      }

      return {
        ...locality,
        features: {
          uat,
          county,
        },
      };
    }
  }

  throw new Error(`No locality match for ${code}`);
}
