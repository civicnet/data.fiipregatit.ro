export function random(max: number): number;
export function random(min: number, max: number): number;
export function random<T>(arr: T[]): T;
export function random<T>(obj: T): T[keyof T];

export function random<T>(first: number | T[], max?: number): number | T {
  if (typeof first === "number" && typeof max === "number") {
    return Math.random() * (max - first) + first;
  }

  if (typeof first === "number" && max === undefined) {
    return Math.random() * first;
  }

  if (Array.isArray(first)) {
    const key = random(first.length - 1) | 0;
    return first[key];
  }

  if (typeof first === "object") {
    const keys = Object.keys(first);
    const randKey = random(keys);
    return first[randKey];
  }

  throw new Error(`Invalid arguments: ${first}, ${max}`);
}
