import { useEffect, RefObject, useCallback } from "react";

interface UseMouseHandlersProps {
  isLoaded: boolean;
  containerRef: RefObject<HTMLDivElement>;
  parallaxRef: RefObject<any>;
  scrollDirection: React.MutableRefObject<
    "left" | "right" | "insensitive" | null
  >;
  isScrolling: React.MutableRefObject<boolean>;
  isWheelScrolling: boolean;
  onHoverScrollSensitivity: number;
  api: any;
  totalWidth: number;
  containerWidth: number;
  scrollOffsetRef: React.MutableRefObject<number>;
  setScrollOffset: (offset: number) => void;
  speedCoefficient?: number; // Коэффициент скорости в зависимости от центра
}

export const useMouseHandlers = ({
  isLoaded,
  containerRef,
  parallaxRef,
  scrollDirection,
  isScrolling,
  isWheelScrolling,
  onHoverScrollSensitivity,
  api,
  totalWidth,
  containerWidth,
  scrollOffsetRef,
  setScrollOffset,
  speedCoefficient = 0.001,
}: UseMouseHandlersProps) => {
  //
  const startScrollingProcess = useCallback(() => {
    if (isScrolling.current && scrollDirection.current) {
      let newOffset = scrollOffsetRef.current;

      if (scrollDirection.current === "right") {
        newOffset -= onHoverScrollSensitivity * speedCoefficient; // Умножаем на коэффициент скорости
      } else if (scrollDirection.current === "left") {
        newOffset += onHoverScrollSensitivity * speedCoefficient; // Умножаем на коэффициент скорости
      }

      // Проверяем, чтобы новое смещение находилось в допустимых границах
      const maxScrollOffset = -(totalWidth - containerWidth);
      const clampedOffset = Math.max(Math.min(newOffset, 0), maxScrollOffset);

      // Если новое смещение находится в допустимых границах, применяем его
      if (clampedOffset !== scrollOffsetRef.current) {
        setScrollOffset(clampedOffset);
        scrollOffsetRef.current = clampedOffset;
        api.start({ scrollX: clampedOffset });
      }

      if (isScrolling.current) {
        requestAnimationFrame(startScrollingProcess);
      }
    }
  }, [
    isScrolling,
    scrollDirection,
    onHoverScrollSensitivity,
    totalWidth,
    containerWidth,
    scrollOffsetRef,
    setScrollOffset,
    api,
    speedCoefficient, // Добавляем коэффициент скорости в зависимости
  ]);

  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      if (!isWheelScrolling && isLoaded) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const mouseX = event.clientX;
        if (mouseX > containerCenterX + 100) {
          scrollDirection.current = "right";
        } else if (mouseX < containerCenterX - 100) {
          scrollDirection.current = "left";
        } else {
          scrollDirection.current = "insensitive";
        }
        isScrolling.current = true;
        startScrollingProcess();
      }
    };

    const handleMouseLeave = () => {
      isScrolling.current = false;
      scrollDirection.current = null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const mouseX = event.clientX;
      if (mouseX > containerCenterX + 100) {
        scrollDirection.current = "right";
      } else if (mouseX < containerCenterX - 100) {
        scrollDirection.current = "left";
      } else {
        scrollDirection.current = "insensitive";
      }
      // Меняем коэффициент скорости в зависимости от близости к краю контейнера
      const distanceToEdge = Math.min(
        Math.abs(mouseX - containerRect.left), // От левого
        Math.abs(mouseX - (containerRect.left + containerRect.width)) // От правого края
      );
      speedCoefficient = 0.001 * (containerCenterX - Math.abs(distanceToEdge));
    };

    const parallaxContainer = parallaxRef.current?.container?.current;
    if (parallaxContainer) {
      parallaxContainer.addEventListener("mouseenter", handleMouseEnter);
      parallaxContainer.addEventListener("mouseleave", handleMouseLeave);
      parallaxContainer.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (parallaxContainer) {
        parallaxContainer.removeEventListener("mouseenter", handleMouseEnter);
        parallaxContainer.removeEventListener("mouseleave", handleMouseLeave);
        parallaxContainer.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [
    isLoaded,
    containerRef,
    parallaxRef,
    scrollDirection,
    isScrolling,
    isWheelScrolling,
    startScrollingProcess,
  ]);

  return { startScrollingProcess };
};
