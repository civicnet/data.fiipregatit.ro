import { Feature } from "@turf/turf";
import october from "../data/octombrie.json";
import icu from "../data/icu.json";
import inpatients from "../data/inpatients.json";
import { UATS_URL, COUNTIES_URL } from "../lib/constants";
import { LocalityWithFeatureAndHospitals } from "../types/Locality";
import { Hospital } from "../pages/api/hospitals";

export async function fetchLocalityBySiruta(
  code: string
): Promise<LocalityWithFeatureAndHospitals> {
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
      const icuHospitals = icu.filter(
        (h) => h.locality?.properties.natcode === locality.siruta
      );
      const inpatientHospitals = inpatients.filter(
        (h) => h.locality?.properties.natcode === locality.siruta
      );

      if (!uat) {
        throw new Error(`No uat feature match for ${locality.siruta}`);
      }

      if (!county) {
        throw new Error(`No county feature match for ${locality.county}`);
      }

      return {
        ...locality,
        icu: icuHospitals.map((h) => ({
          name: h.hospital,
          data: h.data,
        })),
        inpatient: inpatientHospitals.map((h) => ({
          name: h.hospital,
          data: h.data,
        })),
        features: {
          uat,
          county,
        },
      };
    }
  }

  throw new Error(`No locality match for ${code}`);
}
