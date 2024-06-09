import { useEffect, RefObject } from "react";

export const useResizeObserver = (
  containerRef: RefObject<HTMLDivElement>,
  setContainerWidth: (width: number) => void
) => {
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef, setContainerWidth]);
};
