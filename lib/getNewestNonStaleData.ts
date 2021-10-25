export function getNewestNonStaleData<T>(
  data: Record<string, T>
): [string, number] | undefined {
  let latest: [string?, T?] = [undefined, undefined];
  for (const [key, value] of Object.entries(data)) {
    if (!latest[0]) {
      latest = [key, value];
      continue;
    }

    if (new Date(latest[0]).valueOf() < new Date(key).valueOf()) {
      latest = [key, value];
    }
  }

  const pairs = Object.entries(data).sort(
    (a, b) =>  new Date(b[0]).valueOf() - new Date(a[0]).valueOf(),
  );

  return pairs.find(([_date, value]) => typeof value === "number") as
    | [string, number]
    | undefined;
}
