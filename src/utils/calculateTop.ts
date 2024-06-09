export const calculateTop = (imageHeight: number, align: string): string => {
  switch (align) {
    case "center":
      return `calc(50% - ${imageHeight / 2}px)`;
    case "bottom":
      return `calc(100% - ${imageHeight}px)`;
    case "top":
    default:
      return "0";
  }
};
