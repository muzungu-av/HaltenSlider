import React, { useEffect, useRef, useState } from "react";
import { Parallax } from "@react-spring/parallax";
import { useSpring, animated } from "@react-spring/web";
import { useImageLoader } from "./hooks/useImageLoader";
import { useMouseHandlers } from "./hooks/useMouseHandlers";
import { useWheelHandler } from "./hooks/useWheelHandler";
import { useResizeObserver } from "./hooks/useResizeObserver";
import { calculateTop } from "./utils/calculateTop";

interface HaltenSliderImage {
  src: string;
  proportional_height: number;
  pos_x?: number;
  pos_y?: number;
}

interface HaltenSliderProps {
  images: HaltenSliderImage[];
  height: string;
  mode: "linear" | "mosaic";
  imageSpacing?: number;
  imgStyle?: React.CSSProperties;
  align?: "top" | "center" | "bottom";
  leftButtonRef?: React.RefObject<HTMLButtonElement>;
  rightButtonRef?: React.RefObject<HTMLButtonElement>;
  wheelScrollSensitivity?: number;
  btnScrollStep?: number;
  onHoverScrollSensitivity?: number;
  onReady?: () => void;
  onScrollStart?: () => void;
  onChange?: () => void;
  onScrollEnd?: () => void;
  onBtnScrollClick?: (direction: string, scrollX: number) => void;
  onMouseWheelScroll?: () => void;
}

const PARALLAX_CLASS_NAME = "parallax-root-cntr-cls";
const ANIMATED_CLASS_NAME = "animated-cls";
const SLIDER_CLASS_NAME = "slider-container-cls";

export const HaltenSlider: React.FC<HaltenSliderProps> = ({
  images,
  height,
  mode,
  imageSpacing = 0,
  imgStyle,
  align = "top",
  leftButtonRef,
  rightButtonRef,
  wheelScrollSensitivity = 1.0,
  btnScrollStep = 150,
  onHoverScrollSensitivity = 25,
  onReady,
  onScrollStart,
  onChange,
  onScrollEnd,
  onBtnScrollClick,
  onMouseWheelScroll,
}) => {
  // Ссылка на компонент Parallax
  const parallaxRef = useRef<any>(null);
  // Ссылка на контейнер
  const containerRef = useRef<HTMLDivElement>(null);
  // Состояние для текущего смещения скролла
  const [scrollOffset, setScrollOffset] = useState(0);
  // Ref для актуального значения смещения
  const scrollOffsetRef = useRef(0);
  // Состояния для общей ширины и ширины контейнера
  const [totalWidth, setTotalWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  // Флаг для отслеживания загрузки изображений
  const [isLoaded, setIsLoaded] = useState(false);
  // Состояния для направления скролла и флага скроллинга
  const scrollDirection = useRef<"left" | "right" | null>(null);
  const isScrolling = useRef<boolean>(false);
  // Состояние для отслеживания скроллинга колесом мыши
  const [isWheelScrolling, setIsWheelScrolling] = useState(false);

  // Состояние анимации
  const [styles, api] = useSpring(() => ({
    scrollX: 0,
    onStart: () => onScrollStart?.(),
    onChange: () => onChange?.(),
    onRest: () => onScrollEnd?.(),
  }));

  useResizeObserver(containerRef, setContainerWidth);

  const borderSize =
    typeof imgStyle?.border === "string"
      ? parseInt(imgStyle.border.split(" ")[0])
      : typeof imgStyle?.border === "number"
      ? imgStyle.border
      : 0;

  useImageLoader({
    images,
    height,
    mode,
    imageSpacing,
    borderSize,
    setTotalWidth,
    setIsLoaded,
    onReady,
  });

  // Обновление ref смещения
  useEffect(() => {
    scrollOffsetRef.current = scrollOffset;
  }, [scrollOffset]);

  useMouseHandlers({
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
  });

  useWheelHandler({
    parallaxRef,
    wheelScrollSensitivity,
    totalWidth,
    containerWidth,
    scrollOffsetRef,
    setScrollOffset,
    onMouseWheelScroll,
    setIsWheelScrolling,
    api,
  });

  const handleLeftButtonClick = () => {
    const newOffset = scrollOffsetRef.current + btnScrollStep;
    const maxScrollOffset = -(totalWidth - containerWidth);
    const clampedOffset = Math.max(Math.min(newOffset, 0), maxScrollOffset);
    setScrollOffset(clampedOffset);
    scrollOffsetRef.current = clampedOffset;
    if (onBtnScrollClick) {
      onBtnScrollClick("left", clampedOffset);
    }
    api.start({ scrollX: clampedOffset });
  };

  const handleRightButtonClick = () => {
    const newOffset = scrollOffsetRef.current - btnScrollStep;
    const maxScrollOffset = -(totalWidth - containerWidth);
    const clampedOffset = Math.max(Math.min(newOffset, 0), maxScrollOffset);
    setScrollOffset(clampedOffset);
    scrollOffsetRef.current = clampedOffset;
    if (onBtnScrollClick) {
      onBtnScrollClick("right", clampedOffset);
    }
    api.start({ scrollX: clampedOffset });
  };

  return (
    <div
      className={SLIDER_CLASS_NAME}
      style={{ overflow: "hidden", width: "100%" }}
      ref={containerRef}
    >
      <Parallax
        pages={Math.ceil(totalWidth / containerWidth)}
        horizontal
        ref={parallaxRef}
        className={PARALLAX_CLASS_NAME}
        style={{
          overflow: "hidden",
          height: height,
          maxWidth: "100%",
          position: "relative",
        }}
      >
        <animated.div
          className={ANIMATED_CLASS_NAME}
          style={{
            display: "flex",
            overflow: "hidden",
            position: "relative",
            height: "100%",
            width: `${totalWidth}px`,
            transform: styles.scrollX.to((x) => `translate3d(${x}px, 0, 0)`),
            flexDirection: mode === "linear" ? "row" : "initial",
          }}
        >
          {images.map(({ src, proportional_height, pos_x, pos_y }, index) => {
            const imageHeight = (parseInt(height) * proportional_height) / 100;
            const topPosition =
              mode === "linear"
                ? calculateTop(imageHeight, align)
                : `${pos_y}px`;

            return (
              <div
                key={index}
                style={{
                  position: mode === "linear" ? "relative" : "absolute",
                  left: mode === "linear" ? undefined : `${pos_x}px`,
                  top: topPosition,
                  height: `${imageHeight}px`,
                  marginRight:
                    mode === "linear" && index < images.length - 1
                      ? `${imageSpacing}px`
                      : undefined,
                }}
              >
                <img
                  src={src}
                  style={{
                    height: "100%",
                    width: "auto",
                    ...imgStyle,
                  }}
                />
              </div>
            );
          })}
        </animated.div>
      </Parallax>
      <button
        onClick={handleLeftButtonClick}
        ref={leftButtonRef}
        style={{ display: "none" }}
      ></button>
      <button
        onClick={handleRightButtonClick}
        ref={rightButtonRef}
        style={{ display: "none" }}
      ></button>
    </div>
  );
};
