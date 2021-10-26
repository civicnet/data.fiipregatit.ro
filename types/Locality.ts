import { Feature, GeoJSONObject } from "@turf/helpers";
import type Localities from "../data/octombrie.json";

export type Locality = typeof Localities[0];

export type LocalityWithFeature = typeof Localities[0] & {
  features: {
    uat: Feature;
    county: Feature;
  };
};

export type LocalityWithFeatureAndHospitals = LocalityWithFeature & {
  icu: {
    name: string,
    data: Record<string, number | string>,
  }[],
  inpatient: {
    name: string,
    data: Record<string, number | string>,
  }[],
};
