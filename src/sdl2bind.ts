import * as ffi from "ffi-napi";
import * as ref from "ref-napi";
import { getSDL2Lib } from "./getLibrary.js";

const VOID = ref.types.void;
const VOIDPTR = ref.refType(VOID);
const SDL2_Structure = ref.types.void;
const SDL2_StructurePtr = ref.refType(SDL2_Structure);
const SDL2_Window = ref.types.void;
const SDL2_WindowPtr = ref.refType(SDL2_Window);
const SDL2_Renderer = ref.types.void;
const SDL2_RendererPtr = ref.refType(SDL2_Renderer);
const SDL2_Surface = ref.types.void;
const SDL2_SurfacePtr = ref.refType(SDL2_Surface);
const SDL2_Texture = ref.types.void;
const SDL2_TexturePtr = ref.refType(SDL2_Texture);

export const SDL_Init_Flags = {
	SDL_INIT_TIMER: 0x00000001,
	SDL_INIT_AUDIO: 0x00000010,
	SDL_INIT_VIDEO: 0x00000020,
	SDL_INIT_JOYSTICK: 0x00000200,
	SDL_INIT_HAPTIC: 0x00001000,
	SDL_INIT_GAMECONTROLLER: 0x00002000,
	SDL_INIT_EVENTS: 0x00004000,
	SDL_INIT_SENSOR: 0x00008000,
	SDL_INIT_NOPARACHUTE: 0x00100000,
}

export const SDL_Init_Everything =
	SDL_Init_Flags.SDL_INIT_TIMER |
	SDL_Init_Flags.SDL_INIT_AUDIO |
	SDL_Init_Flags.SDL_INIT_VIDEO |
	SDL_Init_Flags.SDL_INIT_JOYSTICK |
	SDL_Init_Flags.SDL_INIT_HAPTIC |
	SDL_Init_Flags.SDL_INIT_GAMECONTROLLER |
	SDL_Init_Flags.SDL_INIT_EVENTS |
	SDL_Init_Flags.SDL_INIT_SENSOR |
	SDL_Init_Flags.SDL_INIT_NOPARACHUTE;

export const SDL_WindowPos = {
	SDL_WINDOWPOS_CENTERED: 0x2FFF0000,
	SDL_WINDOWPOS_UNDEFINED: 0x1FFF0000
}

export const SDL_Window_Flags = {
	SDL_WINDOW_FULLSCREEN: 0x00000001,         /**< fullscreen window */
	SDL_WINDOW_OPENGL: 0x00000002,             /**< window usable with OpenGL context */
	SDL_WINDOW_SHOWN: 0x00000004,              /**< window is visible */
	SDL_WINDOW_HIDDEN: 0x00000008,             /**< window is not visible */
	SDL_WINDOW_BORDERLESS: 0x00000010,         /**< no window decoration */
	SDL_WINDOW_RESIZABLE: 0x00000020,          /**< window can be resized */
	SDL_WINDOW_MINIMIZED: 0x00000040,          /**< window is minimized */
	SDL_WINDOW_MAXIMIZED: 0x00000080,          /**< window is maximized */
	SDL_WINDOW_MOUSE_GRABBED: 0x00000100,      /**< window has grabbed mouse input */
	SDL_WINDOW_INPUT_FOCUS: 0x00000200,        /**< window has input focus */
	SDL_WINDOW_MOUSE_FOCUS: 0x00000400,        /**< window has mouse focus */
	SDL_WINDOW_FOREIGN: 0x00000800,            /**< window not created by SDL */
	SDL_WINDOW_ALLOW_HIGHDPI: 0x00002000,      /**< window should be created in high-DPI mode if supported.
                                                     On macOS NSHighResolutionCapable must be set true in the
                                                     application's Info.plist for this to have any effect. */
	SDL_WINDOW_MOUSE_CAPTURE: 0x00004000,   /**< window has mouse captured (unrelated to MOUSE_GRABBED) */
	SDL_WINDOW_ALWAYS_ON_TOP: 0x00008000,   /**< window should always be above others */
	SDL_WINDOW_SKIP_TASKBAR: 0x00010000,   /**< window should not be added to the taskbar */
	SDL_WINDOW_UTILITY: 0x00020000,   /**< window should be treated as a utility window */
	SDL_WINDOW_TOOLTIP: 0x00040000,   /**< window should be treated as a tooltip */
	SDL_WINDOW_POPUP_MENU: 0x00080000,   /**< window should be treated as a popup menu */
	SDL_WINDOW_KEYBOARD_GRABBED: 0x00100000,   /**< window has grabbed keyboard input */
	SDL_WINDOW_VULKAN: 0x10000000,   /**< window usable for Vulkan surface */
	SDL_WINDOW_METAL: 0x20000000,   /**< window usable for Metal view */
}

export const SDL2 = ffi.Library(getSDL2Lib(), {
	"SDL_Init": ["int", ["uint32"]],
	"SDL_Quit": ["void", ["void"]],
	"SDL_GetError": ["string", ["void"]],
	"SDL_CreateWindow": [SDL2_WindowPtr, ["string", "int", "int", "int", "int", "uint32"]],
	"SDL_Delay": ["void", ["uint32"]],
	"SDL_CreateRenderer": [SDL2_RendererPtr, [SDL2_WindowPtr, "int", "uint32"]],
	"SDL_ShowWindow": ["void", [SDL2_WindowPtr]],
	"SDL_HideWindow": ["void", [SDL2_WindowPtr]],
	"SDL_SetRenderDrawColor": ["void", [SDL2_RendererPtr, "int", "int", "int", "int"]],
	"SDL_RenderClear": ["void", [SDL2_RendererPtr]],
	"SDL_RenderPresent": ["void", [SDL2_RendererPtr]],
	"SDL_RenderDrawPoint": ["int", [SDL2_RendererPtr, "int", "int"]],
	"SDL_RenderDrawLine": ["int", [SDL2_RendererPtr, "int", "int", "int", "int"]],
	"SDL_CreateRGBSurfaceFrom": [SDL2_SurfacePtr, [VOIDPTR, "int", "int", "int", "int", "uint32", "unit32", "unit32", "unit32"]]
});