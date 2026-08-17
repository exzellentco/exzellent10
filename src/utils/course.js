export const getCreditCost = (groupType) => {
  switch (groupType) {
    case "one-to-one":
      return 1000;
    case "class":
      return 250;
    default:
      return 50;
  }
};
