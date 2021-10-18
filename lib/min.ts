export const min = (arr: number[]): number | undefined => {
  let min;
  for (const n of arr) {
    if (!min || n < min) {
      min = n;
    }
  }

  return min;
};
