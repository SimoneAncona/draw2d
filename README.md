# Simply2D
## Introduction
This library for nodejs allows you, thanks to SDL2, to create windows and draw on the screen. 

## Installation
You can install this library using `npm i simply2d`.  
This library require `SDL2` in order to run. Simple DirectMedia Layer is a cross-platform library designed to provide low level access to different resources such as video. SDL2 is available for windows, linux and macos as well.

### For Linux
To use Simply2D you must have installed SDL2. To install it you can use the following command:
- For Ubuntu: `sudo apt install libsdl2-2.0-0 libsdl2-image-2.0-0 libsdl2-ttf-2.0-0`
- For Red Hat and Fedora: `sudo dnf install SDL2 SDL2_image SDL2_ttf`

## API
### Canvas
The `Canvas` class allows you to create a canvas and to draw on it
```ts
import { Canvas } from "simply2d";
const canvas = new Canvas(
	"my canvas",	// window title
	600,			// window width
	400,			// window height
);
```
You can specify other window options
```ts
const canvas = new Canvas("title", 200, 400, 0, 0, {
	mode: "fullscreen",
	resizable: false,
	scale: 2
})
```

### Canvas.show
```ts
show(): void
```
Show the window

### Canvas.hide
```ts
hide(): void
```
Hide the window

### Canvas.setBackgroundColor
```ts
setBackgroundColor(color: RGBAColor): void
```
Set the background color. An RGBAColor is an object that contains `red`, `green`, `blue` and `alpha` properties.

### Canvas.sleep
```ts
sleep(ms: number): void
```
Sleep `ms` milliseconds

### Canvas.drawPoint
```ts
drawPoint(color: RGBAColor, position: Position): void
```
Draw a point on the screen. Position is an object with the x and y properties.

### Canvas.drawLine
```ts
drawLine(color: RGBAColor, from: Position, to: Position): void
```
Draw a line from `from` coordinates to `to` coordinates

### Canvas.drawRectangle
```ts
drawRectangle(color: RGBAColor, pos: Position, width: number, height: number, fill?: boolean): void
```
Draw a rectangle in the canvas

### Canvas.getWidth
```ts
getWidth(): void
```
Return the window width

### Canvas.getHeight
```ts
getHeight(): void
```
Return the window height

### Canvas.clear
```ts
clear(): void
```
Clear the screen

### Canvas.loadRawData
```ts
loadRawData(pixels: Uint8Array, bitPerPixel: 8 | 16 | 24 | 32): void
```
Write directly into the video buffer

### Canvas.loadPNG
```ts
loadPNG(filename: string): void
```
Write an PNG image into the canvas

### Canvas.loadJPG
```ts
loadJPG(filename: string): void
```
Write a JPG image into the canvas

### Canvas.dumpPNG
```ts
dumpPNG(filename: string): void
```
Save the canvas as a PNG file

### Canvas.dumpJPG
```ts
dumpJPG(filename: string): void
```
Save the canvas as a JPG file

### Canvas.getScale
```ts
getScale(): number
```
Return the scale factor

### Canvas.onClick
```ts
onClick(callback: (x: number, y: number) => void): void
```
On click event

### Canvas.onKeyDown
```ts
onKeyDown(callback: (key: Key) => void): void
```
On key down event

### Canvas.onKeyUp
```ts
onKeyUp(callback: (key: Key) => void): void
```
On key up event

### Canvas.initRenderSequence
```ts
initRenderSequence(): void
```
It is used to initialize the rendering sequence. Every drawing process will not be displayed until exposeRender is called

### Canvas.exposeRender
```ts
exposeRender(): void
```
Shows rendering

### Canvas.waitFrame
```ts
waitFrame(): void
```
Sleep for a certain time before the next frame is rendered

### Canvas.loop
```ts
loop(callback: () => void): void
```
Start the rendering loop

### Canvas.onKeysDown
```ts
onKeysDown(callback: (key: Key[]) => void): void
```
On keys down event

### Canvas.onKeysUp
```ts
onKeysUp(callback: (key: Key[]) => void): void
```
On keys up event

### Canvas.loadFont
```ts
loadFont(fontName: string, filePath: string): void
```
Load a new font

### Canvas.drawText
```ts
drawText(text: string, fontName: string, size: number, color: RGBAColor, start: Position): void
```
Draw text on the canvas 

### Canvas.drawArc
```ts
drawArc(color: RGBAColor, center: Position, radius: number, startingAngle: number, endingAngle: number): void
```
Draw an arc

### Canvas.convertPolarCords
```ts
convertPolarCoords(center: Position, angle: number, radius: number): Position
```
Convert polar coordinates into x, y coordinates

### Canvas.loadTexture
```ts
loadTexture(textureID: string, filePath: string): void
```
Load a new texture from the specified file

### Canvas.drawTexture
```ts
drawTexture(textureID: string, pos: Position): void
```
Draw a previously loaded texture

### Canvas.getScreenResolution
```ts
static getScreenResolution(): Resolution
```
Get the screen resolution

### Canvas.getTextureResolution
```ts
getTextureResolution(textureID: string): Resolution
```
Get the resolution of a previously loaded texture

### Canvas.drawPath
```ts
drawPath(path: Path, pos?: Position, color?: RGBAColor)
```
Draw a path

### Canvas constant positions
It is possible to access constant positions relative to the size of the canvas. Example:
```ts
import { Canvas, Colors } from "simply2d"

const canvas = new Canvas("myCanvas", 200, 200);
canvas.drawLine(Colors.BLUE, canvas.TOP_LEFT /* the top left corner */, canvas.BOTTOM_RIGHT /* the bottom right corner */);
```

### Colors
Colors is an object that contains different standard colors and some useful function
```ts
import { Canvas, Colors } from "simply2d";
const canvas = new Canvas("title", 100, 100);
canvas.setBackgroundColor(Colors.RED);	// #FF0000 hex color
canvas.drawLine(
	Colors.BLACK, 	// #000000 hex color
	{
		x: 0,
		y: 0
	},
	{
		x: canvas.getWidth(),
		y: canvas.getHeight()
	}
);
```

### Colors.from8bit
```ts
from8bit(color256: number): RGBAColor
```
Convert an 8 bit color into a 24 bit color

### Colors.from16bit
```ts
from16bit(color: number): RGBAColor
```
Convert a 16 bit color into a 24 bit color

### Colors.from24bit
```ts
from24bit(color: number): RGBAColor
```
Convert a 24 bit color number into a 24 bit color RGBAColor object

### Colors.from32bit
```ts
from32bit(color: number): RGBAColor
```
Convert a 32 bit color number into a RGBAColor object

### Position
Is a type for storing coordinates
```ts
import { Position } from "simply2d"	// only in typescript
let cord: Position = {
	x: 203,
	y: 301
}
```

### RGBAColor
Used to save RGBA color values
```ts
import { RGBAColor } from "simply2d"	// only in typescript
let color: RGBAColor = {
	red: 255,
	green: 255,
	blue: 0,
	alpha: 255
}
```

### Resolution
Used to save a pair of width and height values
```ts
import { Resolution } from "simply2d"
let res: Resolution = {
	w: 1920,
	h: 1080
}
```

### Path
A path is an object used to represent a polyline
```ts
import { Path } from "simply2d";
const p = new Path();
p.setStart({ x: 10, y: 15 });
p.pushLine({ x: 20, y: 60 });
p.close();
```