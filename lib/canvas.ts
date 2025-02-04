import { clearRenderingSequence, clearWithColor, getRenderer, getTicks, getWindow, onClickEvent, onKeyDownEvent, onKeyUpEvent, onKeysDownEvent, onKeysUpEvent, refresh, renderPresent, saveJPG, savePNG, setJPG, setLine, setPNG, setPoint, setRawData, setRectangle, setRenderingSequence, watchRawData, setAntialias, setText, setArc, sdl2bind, setTexture, render } from "./sdl2int.js";
import { SDL_PIXEL_FORMAT, SDL_WindowPos, SDL_Window_Flags } from "./sdlValues.js";
import { CanvasOptions, Key, Layer, PixelFormat, Position, RGBAColor, Resolution } from "./types.js";
import { Path } from "./path.js";
import { Colors } from "./colors.js";
import fs from "fs";

export class Canvas {

	protected _width: number;
	protected _height: number;
	protected _window: ArrayBuffer;
	protected _renderer: ArrayBuffer;
	protected _currentBitPerPixel: PixelFormat;
	protected _scale: number;
	protected _startFrameTime: number;
	protected _frameTime: number;
	protected _isLoopMode: boolean;
	protected _loop: NodeJS.Timeout;
	protected _fonts: { fontName: string, file: string }[];
	protected _textures: { textureID: string, file: string }[];
	private _currentFrametime: number;
	protected _antialias: boolean;
	protected _isAttachedMode: boolean;
	protected _attachLoop: NodeJS.Timeout;
	TOP_LEFT: Position;
	TOP_RIGHT: Position;
	TOP_CENTER: Position;
	CENTER_LEFT: Position;
	CENTER_RIGHT: Position;
	CENTER: Position;
	BOTTOM_LEFT: Position;
	BOTTOM_RIGHT: Position;
	BOTTOM_CENTER: Position;

	constructor(
		windowTitle: string,
		width: number,
		height: number,
		xPos: number = SDL_WindowPos.SDL_WINDOWPOS_CENTERED,
		yPos: number = SDL_WindowPos.SDL_WINDOWPOS_CENTERED,
		options: CanvasOptions = {
			mode: "shown",
			resizable: false,
			scale: 1,
			antiAliasing: true,
			removeWindowDecoration: false,
		}
	) {
		if (!options.mode) options.mode = "shown";
		if (!options.resizable) options.resizable = false;
		if (!options.scale) options.scale = 1;
		if (options.antiAliasing === undefined || options.antiAliasing === null) options.antiAliasing = true;
		if (!options.removeWindowDecoration) options.removeWindowDecoration = false;
		let flags: number;
		this._width = width;
		this._height = height;
		this._scale = Math.floor(options.scale);
		if (!xPos) {
			xPos = SDL_WindowPos.SDL_WINDOWPOS_CENTERED;
		}
		if (!yPos) {
			yPos = SDL_WindowPos.SDL_WINDOWPOS_CENTERED;
		}
		flags = SDL_Window_Flags.SDL_WINDOW_SHOWN;
		this._antialias = options.antiAliasing == true;
		if (options.antiAliasing) {
			setAntialias();
		}
		if (options.mode === "fullscreen") flags |= SDL_Window_Flags.SDL_WINDOW_FULLSCREEN;
		else if (options.mode === "hidden") flags |= SDL_Window_Flags.SDL_WINDOW_HIDDEN;
		else if (options.mode === "maximized") flags |= SDL_Window_Flags.SDL_WINDOW_MAXIMIZED;
		else if (options.mode === "minimized") flags |= SDL_Window_Flags.SDL_WINDOW_MINIMIZED;
		else if (options.mode === "shown") flags |= SDL_Window_Flags.SDL_WINDOW_SHOWN;
		this._currentBitPerPixel = 32;
		this._window = getWindow(windowTitle, xPos, yPos, width, height, flags, this._scale);
		if (options.removeWindowDecoration) sdl2bind.removeBorders(this._window);
		this._renderer = getRenderer(this._window, -1, 0);
		this._frameTime = 2;
		this._fonts = [];
		this._textures = [];

		this.TOP_LEFT = {} as Position;
		this.TOP_CENTER = {} as Position;
		this.TOP_RIGHT = {} as Position;
		this.CENTER_LEFT = {} as Position;
		this.CENTER = {} as Position;
		this.CENTER_RIGHT = {} as Position;
		this.BOTTOM_LEFT = {} as Position;
		this.BOTTOM_CENTER = {} as Position;
		this.BOTTOM_RIGHT = {} as Position;
		Object.defineProperties(this.TOP_LEFT, { x: { value: 0, writable: false }, y: { value: 0, writable: false } });
		Object.defineProperties(this.TOP_CENTER, { x: { value: width / 2, writable: false }, y: { value: 0, writable: false } });
		Object.defineProperties(this.TOP_RIGHT, { x: { value: width, writable: false }, y: { value: 0, writable: false } });
		Object.defineProperties(this.CENTER_LEFT, { x: { value: 0, writable: false }, y: { value: height / 2, writable: false } });
		Object.defineProperties(this.CENTER, { x: { value: width / 2, writable: false }, y: { value: height / 2, writable: false } });
		Object.defineProperties(this.CENTER_RIGHT, { x: { value: width, writable: false }, y: { value: height / 2, writable: false } });
		Object.defineProperties(this.BOTTOM_LEFT, { x: { value: 0, writable: false }, y: { value: height, writable: false } });
		Object.defineProperties(this.BOTTOM_CENTER, { x: { value: width / 2, writable: false }, y: { value: height, writable: false } });
		Object.defineProperties(this.BOTTOM_RIGHT, { x: { value: width, writable: false }, y: { value: height, writable: false } });
	}

	/**
	 * Show the window
	 * @since v0.1.0
	 */
	show() {
		sdl2bind.showWindow(this._window);
	}

	/**
	 * Hide the window
	 * @since v0.1.0
	 */
	hide() {
		sdl2bind.hideWindow(this._window);
	}

	/**
	 * Change the background color
	 * @param {RGBAColor} color the color of the background
	 * @since v0.1.0
	 */
	setBackgroundColor(color: RGBAColor) {
		clearWithColor(this._renderer, color.red, color.green, color.blue, color.alpha);
	}

	/**
	 * Sleep `ms` milliseconds
	 * @param {number} ms milliseconds 
	 * @since v0.1.0
	 */
	sleep(ms: number) {
		sdl2bind.delay(ms);
	}

	/**
	 * Draw a pixel in the canvas
	 * @param {RGBAColor} color the color of the pixel 
	 * @param {Position} position the position in the canvas
	 * @since v0.1.0
	 */
	drawPoint(color: RGBAColor, position: Position) {
		setPoint(this._renderer, color.red, color.green, color.blue, color.alpha, position.x * this._scale, position.y * this._scale);
	}

	/**
	 * Draw a line in the canvas
	 * @param {RGBAColor} color the color of the line
	 * @param {Position} from the starting position 
	 * @param {Position} to the ending
	 * @since v0.1.0
	 */
	drawLine(color: RGBAColor, from: Position, to: Position) {
		setLine(this._renderer, color.red, color.green, color.blue, color.alpha, from.x, from.y, to.x, to.y);
	}

	/**
	 * Draw a rectangle
	 * @param {RGBAColor} color the border color
	 * @param {Position} pos the top left corner of the rectangle
	 * @param {number} width the width 
	 * @param {number} height the height
	 * @param {boolean} fill fill the rectangle
	 * @since v0.1.10 
	 * @updated with v1.0.6
	 * 
	 */
	drawRectangle(color: RGBAColor, pos: Position, width: number, height: number, fill: boolean = false) {
		setRectangle(this._renderer, pos.x, pos.y, width, height, color.red, color.green, color.blue, color.alpha, fill);
	}

	/**
	 * Draw an image from raw data on the canvas
	 * @param {Uint8Array} pixels the array of pixels
	 * @param {PixelFormat} bitPerPixel the bit size of the color
	 * 	- 8 = 3 bit RED, 3 bit GREEN, 2 bit BLUE
	 *  - 16 = 5 bit RED, 6 bit GREEN, 5 bit BLUE
	 *  - 24 = 8 bit RED, 8 bit GREEN, 8 bit BLUE
	 *  - 32 = 8 bit RED, 8 bit GREEN, 8 bit BLUE, 8 bit alpha channel
	 * @since v0.1.9
	 * 
	 * Consider using attach function if you want to 
	 * load raw data in a loop
	 */
	loadRawData(pixels: Uint8Array, bitPerPixel: PixelFormat = this._currentBitPerPixel) {
		if ((pixels.length / (bitPerPixel / 8)) !== this._height * this._width) throw `The buffer must be the same size as the canvas resolution times the number of bytes per pixel (${this._width * this._height * (bitPerPixel / 8)})`;
		if (!(bitPerPixel === 8 || bitPerPixel === 16 || bitPerPixel === 24 || bitPerPixel === 32)) throw "The bitPerPixel param must be 8, 16, 24 or 32";
		this._currentBitPerPixel = bitPerPixel;
		setRawData(this._renderer, pixels, bitPerPixel, this._width, this._height);
	}


	/**
	 * Draw an image on the canvas
	 * @param {string} filename the name of the image file
	 * @since v0.1.9
	 */
	loadPNG(filename: string) {
		setPNG(this._renderer, filename);
	}

	/**
	 * Draw an image on the canvas
	 * @param {string} filename the name of the image file
	 * @since v0.1.9
	 */
	loadJPG(filename: string) {
		setJPG(this._renderer, filename);
	}

	/**
	 * Return the width of the window 
	 * @returns {number} the width of the window
	 * @since v0.1.0
	 * @deprecated Use get width
	 */
	getWidth(): number { return this._width };

	/**
	 * Return the width of the window 
	 * @returns {number} the width of the window
	 * @since v1.3.1
	 */
	get width(): number { return this._width };

	/**
	 * Return the height of the window 
	 * @returns {number} the height of the window
	 * @since v0.1.0
	 * @deprecated Use get height
	 */
	getHeight(): number { return this._height };

	/**
	 * Return the height of the window 
	 * @returns {number} the height of the window
	 * @since v1.3.1
	 */
	get height(): number { return this._height };

	/**
	 * Clear the canvas
	 * @since v0.1.3
	 */
	clear() {
		clearWithColor(this._renderer, 0, 0, 0, 255);
	}

	/**
	 * Get the current pixel format
	 * @returns {PixelFormat} the current pixel format
	 * @since v1.0.4
	 */
	get bitPerPixel(): PixelFormat {
		return this._currentBitPerPixel;
	}

	/**
	 * Get the video buffer
	 * @returns {Uint8Array} the video buffer
	 * @since v1.0.4
	 */
	getRawData(): Uint8Array {
		return watchRawData(this._renderer, this._width, this._height);
	}

	/**
	 * Save a screenshot of the render
	 * @param {string} filename the file 
	 * @since v1.0.4
	 */
	dumpPNG(filename: string) {
		savePNG(this._renderer, this._width, this._height, filename);
	}

	/**
	 * Save a screenshot of the render
	 * @param {string} filename the file 
	 * @since v1.0.4
	 */
	dumpJPG(filename: string) {
		saveJPG(this._renderer, this._width, this._height, filename);
	}

	/**
	 * Get the scale factor
	 * @returns {number} scale factor
	 * @since v1.0.5
	 * @deprecated Use get scale
	 */
	getScale(): number {
		return this._scale;
	}

	/**
	 * Get the scale factor
	 * @returns {number} scale factor
	 * @since v1.3.5
	 */
	get scale(): number {
		return this._scale;
	}

	/**
	 * On click event
	 * @param {function} callback a function that takes x and y coordinates
	 * @since v1.0.6
	 */
	onClick(callback: (x: number, y: number) => void): void {
		onClickEvent(callback);
	}

	/**
	 * On key down event
	 * @param {function} callback a function that takes the pressed key
	 * @since v1.0.6
	 */
	onKeyDown(callback: (key: Key) => void): void {
		onKeyDownEvent(callback);
	}

	/**
	 * On key up event
	 * @param {function} callback a function that takes the pressed key
	 * @since v1.0.6
	 */
	onKeyUp(callback: (key: Key) => void): void {
		onKeyUpEvent(callback);
	}

	/**
	 * It is used to initialize the rendering sequence. 
	 * Every drawing process will not be displayed until exposeRender is called
	 * @since v1.0.8
	 * @deprecated Use the loop function instead
	 */
	initRenderSequence() {
		setRenderingSequence();
		this._startFrameTime = getTicks();
	}

	/**
	 * Shows the rendering
	 * @since v1.0.8
	 * @deprecated Use the loop function instead
	 */
	exposeRender() {
		clearRenderingSequence();
		renderPresent(this._renderer);
	}

	/**
	 * Sleep for a certain time before the next frame is rendered
	 * @since v1.0.8
	 * @deprecated Use the loop function instead
	 */
	waitFrame() {
		sdl2bind.delay(this._frameTime - (this._startFrameTime - getTicks()));
	}

	/**
	 * Start the rendering loop  
	 * Notice that at the end of every loop, the layer is set to the main layer
	 * @param callback a repeated drawing process
	 * @since v1.0.8
	 * @updated with v1.3.4
	 */
	loop(callback: () => void) {
		if (this._isAttachedMode) throw "Video buffer is attached, use detach to free the video buffer";
		this._isLoopMode = true;
		this._loop = setInterval(() => {
			let loopStartTime = new Date().getTime();
			setRenderingSequence();
			refresh(this._renderer);
			callback();
			this.useMainLayer();
			renderPresent(this._renderer);
			this._currentFrametime = new Date().getTime() - loopStartTime;
		});
	}

	/**
	 * Get frame time
	 * @since v1.3.0
	 */
	get frameTime() {
		if (!this._isLoopMode) throw "Must render the scene with the loop function to get frametime";
		return this._currentFrametime;
	}

	/**
	 * Get fps
	 * @since v1.3.0
	 */
	get fps() {
		if (!this._isLoopMode) throw "Must render the scene with the loop function to get frametime";
		return 1000 / this._currentFrametime;
	}

	/**
	 * On keys down event
	 * @param {function} callback a function that takes the pressed key
	 * @since v1.0.8
	 */
	onKeysDown(callback: (keys: Key[]) => void): void {
		onKeysDownEvent(callback);
	}

	/**
	 * On keys up event
	 * @param {function} callback a function that takes the pressed key
	 * @since v1.0.8
	 */
	onKeysUp(callback: (keys: Key[]) => void): void {
		onKeysUpEvent(callback);
	}

	/**
	 * Draw an arc
	 * @param {number} radius the radius of the arc
	 * @param {number} startingAngle the starting angle (in radians) of the arc
	 * @param {number} endingAngle the ending angle (in radians) of the arc
	 * @param {Position} center the position of the arc
	 * @since v1.2.0
	 */
	drawArc(color: RGBAColor, center: Position, radius: number, startingAngle: number, endingAngle: number): void {
		setArc(this._renderer, center.x, center.y, radius, startingAngle, endingAngle, color.red, color.green, color.blue, color.alpha);
	}

	/**
	 * Draw text on the canvas
	 * @param {string} text the message 
	 * @param {string} fontName the font name (use loadFont to load a font from a tff file) 
	 * @param {number} size the size of the font 
	 * @param {Position} start the position of the text 
	 * @since v1.2.0
	 */
	drawText(text: string, fontName: string, size: number, color: RGBAColor, start: Position): void {
		sdl2bind.setFont(this._searchFont(fontName), size);
		setText(this._renderer, text, color.red, color.green, color.blue, start.x, start.y);
	}

	/**
	 * Load a new font from a TFF file
	 * @param {string} fontName the name of the font
	 * @param {string} filePath the file path
	 * @since v1.2.0
	 */
	loadFont(fontName: string, filePath: string): void {
		if (!fs.existsSync(filePath)) {
			throw "Cannot find the font file";
		}
		this._fonts.push({ fontName: fontName, file: filePath });
	}

	private _searchFont(fontName: string): string {
		for (let font of this._fonts) {
			if (font.fontName == fontName) {
				return font.file;
			}
		}
	}

	/**
	 * Convert polar coordinates into x, y coordinates
	 * @param {number} center 
	 * @param {number} angle 
	 * @param {number} radius 
	 * @returns {Position} converted coordinates
	 * @since v1.2.1
	 * @updated with v1.3.1
	 */
	static convertPolarCoords(center: Position, angle: number, radius: number): Position {
		return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
	}

	/**
	 * Load a texture from a file
	 * @param {string} textureID 
	 * @param {string} filePath 
	 * @since v1.2.1 
	 * @updated with v1.2.2
	 */
	loadTexture(textureID: string, filePath: string): void {
		sdl2bind.loadTextureBuffer(this._renderer, textureID, filePath);
	}

	/**
	 * Draw a texture on the screen
	 * @param {string} textureID 
	 * @param {Position} pos top left corner of the box 
	 * @since v1.2.1 
	 * @updated with v1.2.2
	 */
	drawTexture(textureID: string, pos: Position): void {
		setTexture(this._renderer, pos.x, pos.y, textureID);
	}


	/**
	 * Get the screen resolution
	 * @returns {Resolution} the screen resolution
	 * @since v1.2.1
	 */
	static getScreenResolution(): Resolution {
		return sdl2bind.getScreenRes() as Resolution;
	}

	/**
	 * Get the texture resolution
	 * @param {string} textureID the texture ID
	 * @since v1.2.1 
	 * @updated with v1.2.2
	 */
	getTextureResolution(textureID: string): Resolution {
		return sdl2bind.getTextureRes(this._renderer, textureID) as Resolution;
	}

	/**
	 * Add a new layer to the scene
	 * @param {string} layerID ID of the layer
	 * @since v1.3.0
	 * @updated with v1.3.1
	 */
	addLayer(layerID: string, bitPerPixel: PixelFormat, backgroundColor: RGBAColor = Colors.BLACK): void {
		let format;
		switch (bitPerPixel) {
			case 8:
				format = SDL_PIXEL_FORMAT.SDL_PIXELFORMAT_RGB332;
				break;
			case 16:
				format = SDL_PIXEL_FORMAT.SDL_PIXELFORMAT_RGB565;
				break;
			case 24:
				format = SDL_PIXEL_FORMAT.SDL_PIXELFORMAT_RGB888;
				break;
			case 32:
				format = SDL_PIXEL_FORMAT.SDL_PIXELFORMAT_RGBA8888;
				break;
		}
		sdl2bind.addLayer(this._renderer, layerID, format, this._width, this._height);
		this.changeLayer(layerID);
		this.setBackgroundColor(backgroundColor);
		this.useMainLayer();
	}

	/**
	 * Change the layer to draw
	 * @param {string} layerID ID of the layer
	 * @since v1.3.0
	 */
	changeLayer(layerID: string) {
		sdl2bind.changeCurrentLayer(this._renderer, layerID);
	}

	/**
	 * Draw on the main layer (the canvas)
	 * @since v1.3.0
	 */
	useMainLayer() {
		sdl2bind.focusOutCurrentLayer(this._renderer);
	}

	/**
	 * Remove a layer
	 * @param {string} layerID
	 * @since v1.3.0
	 */
	removeLayer(layerID: string) {
		sdl2bind.removeLayer(layerID);
	}

	/**
	 * Draw a path
	 * @param {Path} path
	 * @param {Position} pos
	 * @param {RGBAColor} color
 	 * @since v1.2.2
	 * @updated with v1.3.3
	 */
	drawPath(path: Path, pos: Position = {x: 0, y: 0}, color?: RGBAColor) {
		const p = path._getPath();
		for (let i = 0; i < p.length - 1; i++) {
			let currentColor = color === undefined ? p[i + 1].color : color;
			sdl2bind.setDrawColor(this._renderer, currentColor.red, currentColor.green, currentColor.blue, currentColor.alpha);
			sdl2bind.drawLine(this._renderer, p[i].pos.x + pos.x, p[i].pos.y + pos.y, p[i + 1].pos.x + pos.x, p[i + 1].pos.y + pos.y);
		}
		render(this._renderer);
	}

	/**
	 * Get all the layers in order of drawing priority
	 * @returns {Layer[]} All layers
	 * @since v1.3.1
	 * @deprecated
	 */
	getLayers(): Layer[] {
		return (sdl2bind.getLayers() as Layer[]).reverse();
	}

	/**
	 * Get all the layers in order of drawing priority
	 * @returns {Layer[]} All layers
	 * @since v1.3.5
	 */
	get layers(): Layer[] {
		return (sdl2bind.getLayers() as Layer[]).reverse();
	}

	/**
	 * Activate a layer  
	 * When a layer is active, it will be rendered
	 * @param {string} layerID 
	 * @since v1.3.1
	 */
	activateLayer(layerID: string) {
		sdl2bind.activateLayer(layerID);
	}

	/**
	 * Deactivate a layer  
	 * When a layer is inactive, it will not be rendered
	 * @param {string} layerID 
	 * @since v1.3.1
	 */
	deactivateLayer(layerID: string) {
		sdl2bind.deactivateLayer(layerID);
	}

	/**
	 * Clear all layers, including the main layer
	 * @since v1.3.2
	 */
	clearAll() {
		sdl2bind.clearAll(this._renderer);
	}

	/**
	 * Enable or disable antialiasing
	 * @since v1.3.2
	 */
	set antialiasing(set: boolean) {
		this._antialias = set;
		if (set) {
			sdl2bind.setAntialias();
			return;
		}
		sdl2bind.clearAntialias();
	}

	/**
	 * Get antialiasing flag
	 * @returns {boolean}
	 * @since v1.3.2
	 */
	get antialiasing(): boolean { return this._antialias; }

	/**
	 * Move the order of the layers changing the drawing priority
	 * @param {string} layerID the layer
	 * @param {"up" | "down"} direction the direction
	 * @param {number} steps how many steps
	 */
	moveLayer(layerID: string, direction: "up" | "down", steps: number = 1): void {
		sdl2bind.moveLayer(layerID, direction === "up", steps);
	}

	/**
	 * Attach a buffer to the video memory
	 * @param {Uint8Array} buffer the buffer
	 * @param {PixelFormat} bitPerPixel pixel format
	 * @since v1.3.3
	 * @updated with v1.3.5
	 */
	attach(buffer: Uint8Array, bitPerPixel: PixelFormat) {
		if (buffer.length !== this._width * this._height * (bitPerPixel / 8)) throw `The buffer must be the same size as the canvas resolution times the number of bytes per pixel (${this._width * this._height * (bitPerPixel / 8)})`;
		if (!(bitPerPixel === 8 || bitPerPixel === 16 || bitPerPixel === 24 || bitPerPixel === 32)) throw "The bitPerPixel param must be 8, 16, 24 or 32";
		this.endLoop();
		this._isAttachedMode = true;
		this._currentBitPerPixel = bitPerPixel;
		let format;
		switch (bitPerPixel) {
			case 8:
				format = SDL_PIXEL_FORMAT.SDL_PIXELFORMAT_RGB332;
				break;
			case 16:
				format = SDL_PIXEL_FORMAT.SDL_PIXELFORMAT_RGB565;
				break;
			case 24:
				format = SDL_PIXEL_FORMAT.SDL_PIXELFORMAT_RGB888;
				break;
			case 32:
				format = SDL_PIXEL_FORMAT.SDL_PIXELFORMAT_RGBA8888;
				break;
		}
		sdl2bind.attach(this._renderer, buffer, format, this._width, this._height);
		this._attachLoop = setInterval(() => {
			sdl2bind.update(this._renderer);
		})
	}

	/**
	 * Detach the current attached buffer
	 * @since v1.3.3
	 * @updated with v1.3.4
	 */
	detach() {
		sdl2bind.detach();
		this._isAttachedMode = false;
		clearInterval(this._attachLoop);
	}

	/**
	 * Close the window
	 * @since v1.3.4
	 */
	close() {
		sdl2bind.close();
	}

	/**
	 * Terminates the loop
	 * @since v1.3.4
	 */
	endLoop() {
		this._isLoopMode = false;
		clearInterval(this._loop);
	}

	/**
	 * Returns the position of the mouse cursor
	 * @returns {Position} The position of the mouse cursor
	 * @since v1.3.5
	 */
	get mousePosition(): Position {
		return sdl2bind.getMousePosition();
	}

	/**
	 * Apply a function to every byte in the framebuffer
	 * @param {Function} fn the filter, a function that takes current pixel value, current pixel index (optional), current buffer (optional)
	 * @since v1.3.7
	 */
	applyFilter(fn: (v: number, i: number, buff: Uint8Array) => number): void {
		let size = this._width * this._height * this.bitPerPixel / 8;
		let buffer = new Uint8Array(size);
		this.attach(buffer, this.bitPerPixel);
		for (let i = 0; i < size; i++)
			buffer[i] = fn(buffer[i], i, buffer);
		this.detach();
	}
}