import { Feature, GeoJSONObject } from "@turf/helpers";
import type Localities from "../data/octombrie.json";

export type Locality = typeof Localities[0];
export type LocalityWithFeature = typeof Localities[0] & {
  features: {
    uat: Feature;
    county: Feature;
  };
};
