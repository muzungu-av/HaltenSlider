# Halten Slider

Halten Slider is a customizable slider component built with React and React Spring.

## Installation

To install the component, run:

```bash
npm install @haltentech/halten-slider
```

# Usage

Here's an example of how to use the Halten Slider:

## Linear Mode

In this simple mode, the pictures line up.

```typescript
import { HaltenSlider } from '@haltentech/halten-slider';

const images = [
  { src: pic_1, proportional_height: 90,},
  { src: pic_2, proportional_height: 30,},
  { src: pic_3, proportional_height: 45,},
  { src: pic_4, proportional_height: 80,},
  { src: pic_5, proportional_height: 50,},
  { src: pic_6, proportional_height: 80,},
  { src: pic_7, proportional_height: 35,},
  { src: pic_8, proportional_height: 40,},
  { src: pic_9, proportional_height: 45 },
  { src: pic_10, proportional_height: 35},
];

const App: React.FC = () => {
  return (
      <HaltenSlider
        images={images}
        mode="linear"
        imageSpacing={15}
        scrollSensitivity={1.5}
        height="500px"
        imgStyle={{ border: '11px solid black' }}
        additionalWidth={22}
        align="top"
      />
  );
};

export default App;
```

__interface HaltenSliderImage__

* *proportional_height* - mandatory attribute. Percentage of the height of the image in the parent container. Frames are not taken into account

__interface HaltenSliderProps:__

* *imageSpacing* - distance in pixels between images, taking into account the border

* *scrollSensitivity* - swipe sensitivity (speed).
* *height* - slider container height.
* *imgStyle* - styles that will be applied to the pictures.
* *additionalWidth* - additional width. This width adjustment is needed by the swipe algorithm if you add borders. Set equal to (border * 2).
* *align* -  Align only valid for *"linear"* mode

## Mosaic Mode

Add additional *pos_x* and *pos_y* to the array with images indicating the position in the scrollable container.

Switch to *mode="mosaic"*

```typescript
import { HaltenSlider } from '@haltentech/halten-slider';

const images = [
  { src: pic_1, proportional_height: 90, pos_x: 0, pos_y: 5 },
  { src: pic_2, proportional_height: 30, pos_x: 250, pos_y: 10 },
  { src: pic_3, proportional_height: 45, pos_x: 250, pos_y: 135 },
  { src: pic_4, proportional_height: 80, pos_x: 450, pos_y: 20 },
  { src: pic_5, proportional_height: 50, pos_x: 650, pos_y: 50 },
  { src: pic_6, proportional_height: 80, pos_x: 930, pos_y: 18 },
  { src: pic_7, proportional_height: 35, pos_x: 1285, pos_y: 10 },
  { src: pic_8, proportional_height: 40, pos_x: 1280, pos_y: 155 },
  { src: pic_9, proportional_height: 45, pos_x: 2700, pos_y: 138 },
  { src: pic_10, proportional_height: 35, pos_x: 1840, pos_y: 160 },
];

const App: React.FC = () => {
  return (
    <HaltenSlider
      mode="mosaic"
      images={images}
      scrollSensitivity={0.9}
      height={"500px"}
      imgStyle={{ border: "11px solid black" }}
    />
  );
};

export default App;
```

