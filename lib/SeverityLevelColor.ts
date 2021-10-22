import { SeverityLevel } from "./SeverityLevel";

export const SeverityLevelColor = {
  geojson: {
    [SeverityLevel.NONE]: "#0571b0",
    [SeverityLevel.LOW]: "#fdcc8a",
    [SeverityLevel.MIDDLE]: "#fc8d59",
    [SeverityLevel.HIGH]: "#e34a33",
    [SeverityLevel.CRITICAL]: "#b30000",
  },
  scatterplot: {
    [SeverityLevel.NONE]: "#0571b0",
    [SeverityLevel.LOW]: "#5e3c99",
    [SeverityLevel.MIDDLE]: "#b2abd2",
    [SeverityLevel.HIGH]: "#fdb863",
    [SeverityLevel.CRITICAL]: "#e66101",
  }
}