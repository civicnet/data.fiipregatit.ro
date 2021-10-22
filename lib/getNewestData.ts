export function getNewestData<T>(data: Record<string, T>): T | undefined {
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

  return latest[1];
}
