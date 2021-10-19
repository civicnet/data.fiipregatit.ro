import { Locality } from "../types/Locality";
import { getNewestLocalityData } from "./getNewestLocalityData";
import { SeverityLevel } from "./SeverityLevel";

export function getSeverityLevel(locality: Locality): SeverityLevel;
export function getSeverityLevel(rate: number): SeverityLevel;

export function getSeverityLevel(
  localityOrRate: Locality | number
): SeverityLevel {
  const rate =
    typeof localityOrRate === "number"
      ? localityOrRate
      : getNewestLocalityData(localityOrRate);

  if (rate === undefined) {
    return SeverityLevel.NONE;
  }

  if (rate < 3) {
    return SeverityLevel.LOW;
  } else if (rate >= 3 && rate < 6) {
    return SeverityLevel.MIDDLE;
  } else if (rate >= 6 && rate < 7.5) {
    return SeverityLevel.HIGH;
  }

  return SeverityLevel.CRITICAL;
}
