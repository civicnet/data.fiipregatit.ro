export const max = (arr: number[]): number | undefined => {
    let max;
    for (const n of arr) {
      if (!max || n > max) {
        max = n;
      }
    }
  
    return max;
  };
  