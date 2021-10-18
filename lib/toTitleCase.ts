export const toTitleCase = (str: string): string => {
    return str.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };
  