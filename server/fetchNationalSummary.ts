import { random } from "../lib/random";

export type NationalSummary = {
  infection: {
    rate: number;
    data: Record<string, number>;
  };
  vaccination: {
    rate: number;
    immunized: number;
    data: Record<string, number>;
  };
  icu: {
    availability: number;
    nonICU: number;
    data: Record<string, number>;
  };
  cases: {
    current: number;
    cured: number;
    deceased: number;
    data: Record<string, number>;
  };
};

export async function fetchNationalSummary(): Promise<NationalSummary> {
  const genData = (
    low: number,
    high: number,
    opts: { whole: boolean } = { whole: true }
  ): Record<string, number> => {
    return Array(29)
      .fill(1)
      .reduce((acc, _, idx) => {
        return {
          ...acc,
          [`2021-10-${idx + 1}`]: opts.whole
            ? Math.ceil(random(low, high))
            : random(low, high),
        };
      }, {});
  };

  const genMonotonicData = (
    low: number,
    high: number,
    opts: { whole: boolean } = { whole: true }
  ): Record<string, number> => {
    return Object.entries(genData(low, high, opts))
      .sort((a, b) => a[1] - b[1])
      .reduce((acc, [, value], idx) => {
        return {
          ...acc,
          [`2021-10-${idx + 1}`]: value,
        };
      }, {});
  };

  return {
    infection: {
      rate: random(6, 12),
      data: genData(6, 12),
    },
    vaccination: {
      rate: random(30, 40),
      immunized: random(4000000, 6000000),
      data: genMonotonicData(4000000, 7000000),
    },
    icu: {
      availability: random(0, 10),
      nonICU: random(5, 20),
      data: genData(0, 10, { whole: false }),
    },
    cases: {
      current: Math.ceil(random(150000, 250000)),
      cured: random(97, 98),
      deceased: random(2, 3),
      data: genMonotonicData(6, 12),
    },
  };
}
