import { CanvasOptions, Key, Position, RGBAColor, Resolution } from "./types.js";
export declare class Canvas {
    protected _width: number;
    protected _height: number;
    protected _window: ArrayBuffer;
    protected _renderer: ArrayBuffer;
    protected _currentBitPerPixel: 8 | 16 | 24 | 32;
    protected _scale: number;
    protected _startFrameTime: number;
    protected _frameTime: number;
    protected _loop: boolean;
    protected _fonts: {
        fontName: string;
        file: string;
    }[];
    protected _textures: {
        textureID: string;
        file: string;
    }[];
    TOP_LEFT: Position;
    TOP_RIGHT: Position;
    TOP_CENTER: Position;
    CENTER_LEFT: Position;
    CENTER_RIGHT: Position;
    CENTER: Position;
    BOTTOM_LEFT: Position;
    BOTTOM_RIGHT: Position;
    BOTTOM_CENTER: Position;
    constructor(windowTitle: string, width: number, height: number, xPos?: number, yPos?: number, options?: CanvasOptions);
    show(): void;
    hide(): void;
    setBackgroundColor(color: RGBAColor): void;
    sleep(ms: number): void;
    drawPoint(color: RGBAColor, position: Position): void;
    drawLine(color: RGBAColor, from: Position, to: Position): void;
    drawRectangle(color: RGBAColor, pos: Position, width: number, height: number, fill?: boolean): void;
    loadRawData(pixels: Uint8Array, bitPerPixel?: 8 | 16 | 24 | 32): void;
    loadPNG(filename: string): void;
    loadJPG(filename: string): void;
    getWidth(): number;
    getHeight(): number;
    clear(): void;
    setBitPerPixel(bitPerPixel: 8 | 16 | 24 | 32): void;
    getBitPerPixel(): 8 | 16 | 24 | 32;
    getRawData(): Uint8Array;
    dumpPNG(filename: string): void;
    dumpJPG(filename: string): void;
    private _scalePosition;
    private _scaleRawData;
    private _getScaledIndexes;
    getScale(): number;
    onClick(callback: (x: number, y: number) => void): void;
    onKeyDown(callback: (key: Key) => void): void;
    onKeyUp(callback: (key: Key) => void): void;
    initRenderSequence(): void;
    exposeRender(): void;
    waitFrame(): void;
    loop(callback: () => void): Promise<void>;
    onKeysDown(callback: (keys: Key[]) => void): void;
    onKeysUp(callback: (keys: Key[]) => void): void;
    drawArc(color: RGBAColor, center: Position, radius: number, startingAngle: number, endingAngle: number): void;
    drawText(text: string, fontName: string, size: number, color: RGBAColor, start: Position): void;
    loadFont(fontName: string, filePath: string): void;
    private _searchFont;
    convertPolarCoords(center: Position, angle: number, radius: number): Position;
    loadTexture(textureID: string, filePath: string): void;
    drawTexture(textureID: string, pos: Position): void;
    static getScreenResolution(): Resolution;
    getTextureResolution(textureID: string): Resolution;
}
