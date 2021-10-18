import { Locality } from "../types/Locality";
import { getNewestLocalityData } from "./getNewestLocalityData";
import { SeverityLevel } from "./SeverityLevel";

export const getSeverityLevel = (locality: Locality): SeverityLevel => {
  const rate = getNewestLocalityData(locality);
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
