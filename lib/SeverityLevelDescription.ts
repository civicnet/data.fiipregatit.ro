import { SeverityLevel } from "./SeverityLevel";

export const SeverityLevelDescription = {
  incidence: {
    [SeverityLevel.NONE]: "N/A",
    [SeverityLevel.LOW]: "sub 3‰",
    [SeverityLevel.MIDDLE]: "între 3‰ și 6‰",
    [SeverityLevel.HIGH]: "între 6‰ și 7,5‰",
    [SeverityLevel.CRITICAL]: "peste 7,5‰",
  },
};
