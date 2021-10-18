import type RawData from "../data/transparenta_octombrie_2021.json";
import { Locality } from "../types/Locality";
import { toTitleCase } from "./toTitleCase";

export const labelForLocality = (locality: Locality): string => {
  return `${locality.uat}, jud. ${locality.county}`;
};
