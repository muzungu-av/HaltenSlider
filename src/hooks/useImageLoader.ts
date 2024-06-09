import { useEffect } from "react";

interface UseImageLoaderProps {
  images: any[];
  height: string;
  mode: string;
  imageSpacing: number;
  borderSize: number;
  setTotalWidth: (width: number) => void;
  setIsLoaded: (loaded: boolean) => void;
  onReady?: () => void;
}

export const useImageLoader = ({
  images,
  height,
  mode,
  imageSpacing,
  borderSize,
  setTotalWidth,
  setIsLoaded,
  onReady,
}: UseImageLoaderProps) => {
  useEffect(() => {
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
              acc += imageWidth - borderSize * 2;
              if (index < loadedImages.length - 1) {
                acc += imageSpacing ?? 0;
              }
              return acc;
            }, 0)
          : images.reduce((acc, image, index) => {
              const img = loadedImages[index];
              const imageHeight =
                (parseInt(height) * image.proportional_height) / 100;
              const imageWidth =
                (img.naturalWidth / img.naturalHeight) * imageHeight;
              const posX = image.pos_x || 0;
              const elementWidth = posX + imageWidth;
              return Math.max(acc, elementWidth) - borderSize;
            }, 0);

      setTotalWidth(calculatedTotalWidth);
      setIsLoaded(true);

      if (onReady) {
        onReady();
      }
    };

    loadImages();
  }, [images, height, mode, imageSpacing, borderSize, onReady]);
};
