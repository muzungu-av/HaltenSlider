import React, { useEffect, useRef, useState } from "react";
import { Parallax } from "@react-spring/parallax";
import { useSpring, animated } from "@react-spring/web";

interface HaltenSliderImage {
  src: string;
  proportional_height: number;
  pos_x?: number;
  pos_y?: number;
}

interface HaltenSliderProps {
  images: HaltenSliderImage[];
  scrollSensitivity: number;
  height: string;
  mode: "linear" | "mosaic";
  imageSpacing?: number;
  imgStyle?: React.CSSProperties;
  additionalWidth?: number;
  align?: "top" | "center" | "bottom";
}

const PARALLAX_CLASS_NAME = "div-parallax-root-cntr";

export const HaltenSlider: React.FC<HaltenSliderProps> = ({
  images,
  imageSpacing,
  scrollSensitivity,
  height,
  mode,
  imgStyle,
  additionalWidth = 0,
  align = "top",
}) => {
  const parallaxRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [{ scrollX }, set] = useSpring(() => ({ scrollX: 0 }));
  const [totalWidth, setTotalWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    // Observer для отслеживания изменения размеров контейнера
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
  }, []);

  useEffect(() => {
    // Загрузка всех изображений и расчет их размеров
    const loadImages = async () => {
      const loadedImages = await Promise.all(
        images.map((image) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.src = image.src;
            img.onload = () => resolve(img);
          });
        })
      );

      const calculatedTotalWidth =
        mode === "linear"
          ? loadedImages.reduce((acc, img, index) => {
              const imageHeight =
                (parseInt(height) * images[index].proportional_height) / 100;
              const imageWidth =
                (img.naturalWidth / img.naturalHeight) * imageHeight;
              acc += imageWidth + additionalWidth;
              return acc;
            }, 0) +
            (images.length - 1) * (imageSpacing || 0)
          : images.reduce((acc, image, index) => {
              const img = loadedImages[index];
              const imageHeight =
                (parseInt(height) * image.proportional_height) / 100;
              const imageWidth =
                (img.naturalWidth / img.naturalHeight) * imageHeight;
              const posX = image.pos_x || 0;
              const elementWidth = posX + imageWidth + additionalWidth;
              return Math.max(acc, elementWidth);
            }, 0);

      setTotalWidth(calculatedTotalWidth);
    };

    loadImages();
  }, [images, height, mode, imageSpacing, additionalWidth]);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (parallaxRef.current) {
        const scrollAmount = event.deltaY * scrollSensitivity;
        setScrollOffset((prev) => {
          const newOffset = prev + scrollAmount;
          const maxScrollOffset = -(totalWidth - containerWidth);
          if (newOffset > 0) {
            return 0;
          } else if (newOffset < maxScrollOffset) {
            return maxScrollOffset;
          } else {
            return newOffset;
          }
        });
        set({ scrollX: scrollOffset });
        event.preventDefault();
      }
    };

    const parallaxContainer = parallaxRef.current.container.current;
    parallaxContainer.addEventListener("wheel", handleScroll, {
      passive: false,
    });

    return () => {
      parallaxContainer.removeEventListener("wheel", handleScroll);
    };
  }, [scrollOffset, set, totalWidth, scrollSensitivity, containerWidth]);

  const calculateTop = (imageHeight: number) => {
    const borderSize = additionalWidth;
    const imageHeightWithBorder = imageHeight + borderSize;

    switch (align) {
      case "center":
        return `calc(50% - ${imageHeightWithBorder / 2}px)`;
      case "bottom":
        return `calc(100% - ${imageHeightWithBorder}px)`;
      default:
        return "0";
    }
  };

  return (
    <div
      className="slider-container"
      style={{ overflow: "hidden", width: "100%", height }}
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
          className="animated_div"
          style={{
            display: "flex",
            overflow: "hidden",
            position: "relative",
            height: "100%",
            width: `${totalWidth}px`,
            transform: scrollX.to((x) => `translate3d(${x}px, 0, 0)`),
            flexDirection: mode === "linear" ? "row" : "initial",
          }}
        >
          {images.map(({ src, proportional_height, pos_x, pos_y }, index) => {
            const imageHeight = (parseInt(height) * proportional_height) / 100;
            const topPosition =
              mode === "linear" ? calculateTop(imageHeight) : `${pos_y}px`;

            return (
              <div
                key={index}
                style={{
                  position: mode === "linear" ? "relative" : "absolute",
                  left: mode === "linear" ? undefined : `${pos_x}px`,
                  top: topPosition,
                  height: `${imageHeight}px`,
                  marginRight:
                    mode === "linear" ? `${imageSpacing}px` : undefined,
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
    </div>
  );
};
