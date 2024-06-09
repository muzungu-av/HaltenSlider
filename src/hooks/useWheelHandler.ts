import { useEffect, RefObject } from "react";

interface UseWheelHandlerProps {
  parallaxRef: RefObject<any>;
  wheelScrollSensitivity: number;
  totalWidth: number;
  containerWidth: number;
  scrollOffsetRef: React.MutableRefObject<number>;
  setScrollOffset: (offset: number) => void;
  onMouseWheelScroll?: () => void;
  setIsWheelScrolling: (scrolling: boolean) => void;
  api: any;
}

export const useWheelHandler = ({
  parallaxRef,
  wheelScrollSensitivity,
  totalWidth,
  containerWidth,
  scrollOffsetRef,
  setScrollOffset,
  onMouseWheelScroll,
  setIsWheelScrolling,
  api,
}: UseWheelHandlerProps) => {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const delta = event.deltaY;
      if (totalWidth > 0 && containerWidth > 0) {
        let newOffset =
          scrollOffsetRef.current - delta * wheelScrollSensitivity;
        const maxScrollOffset = -(totalWidth - containerWidth);
        const clampedOffset = Math.max(Math.min(newOffset, 0), maxScrollOffset);
        setScrollOffset(clampedOffset);
        scrollOffsetRef.current = clampedOffset;
        if (onMouseWheelScroll) {
          onMouseWheelScroll();
        }
        api.start({ scrollX: clampedOffset });
        setIsWheelScrolling(true);
        setTimeout(() => setIsWheelScrolling(false), 500);
      }
    };

    const parallaxContainer = parallaxRef.current?.container?.current;
    if (parallaxContainer) {
      parallaxContainer.addEventListener("wheel", handleWheel, {
        passive: true,
      });
    }

    return () => {
      if (parallaxContainer) {
        parallaxContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, [
    parallaxRef,
    wheelScrollSensitivity,
    totalWidth,
    containerWidth,
    scrollOffsetRef,
    setScrollOffset,
    onMouseWheelScroll,
    setIsWheelScrolling,
    api,
  ]);
};
