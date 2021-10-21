import { Locality } from "../types/Locality";

export const labelForLocality = (locality: Locality): string => {
  return `${locality.uat}, jud. ${locality.county}`;
};
