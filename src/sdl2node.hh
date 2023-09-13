#include <SDL.h>
#include <SDL_ttf.h>
#include <vector>
#include <string>
#include <cmath>
#include <map>
#include "common.hh"

namespace SDL
{
	struct Position
	{
		int x, y;
	};

	Napi::FunctionReference on_click_callback_ref;
	Napi::FunctionReference on_keydown_callback_ref;
	Napi::FunctionReference on_keyup_callback_ref;
	Napi::FunctionReference on_keysdown_callback_ref;
	Napi::FunctionReference on_keysup_callback_ref;
	TTF_Font *current_font;
	bool antialiasing = false;

	Napi::Array get_pressed_keys(Napi::Env env)
	{
		int length;
		const Uint8 *sdl_keys = SDL_GetKeyboardState(&length);
		Napi::Array keys = Napi::Array::New(env);
		uint32_t index = 0;
		for (int i = 0; i < length; i++)
		{
			if (sdl_keys[i])
			{
				keys.Set<Napi::String>(index, Napi::String::New(env, SDL_GetScancodeName(SDL_Scancode(i))));
				index++;
			}
		}
		return keys;
	}

	void handle_events(const Napi::Env &env)
	{
		SDL_Event event;
		SDL_PollEvent(&event);

		int x_mouse;
		int y_mouse;

		switch (event.type)
		{
		case SDL_QUIT:
			SDL_Quit();
			TTF_Quit();
			exit(0);
			break;
		case SDL_MOUSEBUTTONDOWN:
			SDL_GetMouseState(&x_mouse, &y_mouse);
			if (on_click_callback_ref.IsEmpty())
				break;
			on_click_callback_ref.Call({Napi::Number::New(env, x_mouse), Napi::Number::New(env, y_mouse)});
			break;
		case SDL_KEYDOWN:
			if (!on_keydown_callback_ref.IsEmpty())
				on_keydown_callback_ref.Call({Napi::String::New(env, SDL_GetKeyName(event.key.keysym.sym))});
			if (!on_keysdown_callback_ref.IsEmpty())
				on_keysdown_callback_ref.Call({get_pressed_keys(env)});
			break;
		case SDL_KEYUP:
			if (!on_keyup_callback_ref.IsEmpty())
				on_keyup_callback_ref.Call({Napi::String::New(env, SDL_GetKeyName(event.key.keysym.sym))});
			if (!on_keysup_callback_ref.IsEmpty())
				on_keysup_callback_ref.Call({get_pressed_keys(env)});
			break;
		default:
			break;
		}
	}

	inline Position from_angle(int center_x, int center_y, float angle, int radius)
	{
		float sin = static_cast<float>(std::sin(angle));
		float cos = static_cast<float>(std::cos(angle));
		return Position{static_cast<int>(center_x + cos * radius), static_cast<int>(center_y + sin * radius)};
	}

	inline Napi::Value init(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		Uint32 flags = info[0].As<Napi::Number>().Uint32Value();
		return Napi::Number::New(env, SDL_Init(flags));
	}

	inline Napi::Value get_error(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		return Napi::String::New(env, SDL_GetError());
	}

	Napi::Value create_window(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		std::string title = info[0].As<Napi::String>().Utf8Value();
		int x = info[1].As<Napi::Number>().Int64Value();
		int y = info[2].As<Napi::Number>().Int64Value();
		int w = info[3].As<Napi::Number>().Int64Value();
		int h = info[4].As<Napi::Number>().Int64Value();
		Uint32 flags = info[5].As<Napi::Number>().Uint32Value();

		SDL_Window *window = SDL_CreateWindow(title.c_str(), x, y, w, h, flags);
		if (window == NULL)
			return env.Undefined();
		return Napi::ArrayBuffer::New(env, window, sizeof(window));
	}

	Napi::Value create_renderer(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Window *window = (SDL_Window *)get_ptr_from_js(info[0].As<Napi::ArrayBuffer>());
		int index = info[1].As<Napi::Number>().Int64Value();
		Uint32 flags = info[2].As<Napi::Number>().Uint32Value();
		TTF_Init();
		SDL_Renderer *renderer = SDL_CreateRenderer(window, index, flags | SDL_RENDERER_PRESENTVSYNC | SDL_RENDERER_ACCELERATED);
		if (renderer == NULL)
			return env.Undefined();
		return Napi::ArrayBuffer::New(env, renderer, sizeof(renderer));
	}

	Napi::Value show_window(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Window *window = (SDL_Window *)get_ptr_from_js(info[0].As<Napi::ArrayBuffer>());
		SDL_ShowWindow(window);
		return env.Undefined();
	}

	Napi::Value hide_window(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Window *window = (SDL_Window *)get_ptr_from_js(info[0].As<Napi::ArrayBuffer>());
		SDL_HideWindow(window);
		return env.Undefined();
	}

	Napi::Value set_render_draw_color(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		int red = info[1].As<Napi::Number>().Int64Value();
		int green = info[2].As<Napi::Number>().Int64Value();
		int blue = info[3].As<Napi::Number>().Int64Value();
		int alpha = info[4].As<Napi::Number>().Int64Value();
		handle_events(env);
		return Napi::Number::New(env, SDL_SetRenderDrawColor(renderer, red, green, blue, alpha));
	}

	inline Napi::Value render_clear(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		return Napi::Number::New(env, SDL_RenderClear(renderer));
	}

	Napi::Value render_present(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		SDL_RenderPresent(renderer);
		handle_events(env);
		return env.Undefined();
	}

	inline Napi::Value delay(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		int ms = info[0].As<Napi::Number>().Int64Value();
		SDL_Delay(ms);
		handle_events(env);
		return env.Undefined();
	}

	Napi::Value render_draw_point(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		int px = info[1].As<Napi::Number>().Int64Value();
		int py = info[2].As<Napi::Number>().Int64Value();
		handle_events(env);
		return Napi::Number::New(env, SDL_RenderDrawPoint(renderer, px, py));
	}

	Napi::Value render_draw_line(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		int x1 = info[1].As<Napi::Number>().Int64Value();
		int y1 = info[2].As<Napi::Number>().Int64Value();
		int x2 = info[3].As<Napi::Number>().Int64Value();
		int y2 = info[4].As<Napi::Number>().Int64Value();
		handle_events(env);
		if (antialiasing)
		{
			return Napi::Number::New(env, SDL_RenderDrawLine(renderer, x1, y1, x2, y2));
		}
		return Napi::Number::New(env, SDL_RenderDrawLine(renderer, x1, y1, x2, y2));
	}

	Napi::Value render_copy(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		SDL_Texture *texture = (SDL_Texture *)get_ptr_from_js(info[1].As<Napi::ArrayBuffer>());
		SDL_Rect *src = (SDL_Rect *)get_ptr_from_js(info[2].As<Napi::ArrayBuffer>());
		SDL_Rect *dest = (SDL_Rect *)get_ptr_from_js(info[3].As<Napi::ArrayBuffer>());
		handle_events(env);
		return Napi::Number::New(env, SDL_RenderCopy(renderer, texture, NULL, NULL));
	}

	Napi::Value draw_rectangle(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		int x = info[1].As<Napi::Number>().Int64Value();
		int y = info[2].As<Napi::Number>().Int64Value();
		int w = info[3].As<Napi::Number>().Int64Value();
		int h = info[4].As<Napi::Number>().Int64Value();
		bool fill = info[5].As<Napi::Boolean>().Value();
		SDL_Rect rect;
		rect.x = x;
		rect.y = y;
		rect.w = w;
		rect.h = h;
		handle_events(env);
		if (fill)
			return Napi::Number::New(env, SDL_RenderFillRect(renderer, &rect));
		return Napi::Number::New(env, SDL_RenderDrawRect(renderer, &rect));
	}

	Napi::Value create_texture(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		Uint32 flags = info[1].As<Napi::Number>().Uint32Value();
		int access = info[2].As<Napi::Number>().Int64Value();
		int w = info[3].As<Napi::Number>().Int64Value();
		int h = info[4].As<Napi::Number>().Int64Value();
		SDL_Texture *texture = SDL_CreateTexture(renderer, flags, access, w, h);
		handle_events(env);
		return Napi::ArrayBuffer::New(env, texture, sizeof(texture));
	}

	Napi::Value write_texture(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Texture *texture = (SDL_Texture *)get_ptr_from_js(info[0].As<Napi::ArrayBuffer>());
		Napi::Uint8Array pixels = info[1].As<Napi::Uint8Array>();
		uint8_t *raw_pixels = pixels.Data();
		uint8_t *texture_data;
		int pitch;
		if (SDL_LockTexture(texture, NULL, (void **)&texture_data, &pitch) != 0)
		{
			throw Napi::Error::New(env, std::string("Unable to lock texture: ") + SDL_GetError());
		}
		for (size_t i = 0; i < pixels.ElementLength(); i++)
		{
			texture_data[i] = raw_pixels[i];
		}

		SDL_UnlockTexture(texture);
		handle_events(env);
		return env.Undefined();
	}

	Napi::Value read_render(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		int width = info[1].As<Napi::Number>().Int64Value();
		int height = info[2].As<Napi::Number>().Int64Value();
		size_t size = width * height;
		uint8_t *pixels = new uint8_t[size];
		if (SDL_RenderReadPixels(renderer, NULL, SDL_PIXELFORMAT_RGB332, (void *)pixels, width) != 0)
		{
			throw Napi::Error::New(env, std::string("Cannot read data: ") + SDL_GetError());
		}
		handle_events(env);
		return Napi::ArrayBuffer::New(env, (void *)pixels, size);
	}

	Napi::Value set_scale(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		int width = info[1].As<Napi::Number>().Int64Value();
		int height = info[2].As<Napi::Number>().Int64Value();
		int scale = info[3].As<Napi::Number>().Int64Value();
		if (SDL_RenderSetLogicalSize(renderer, width * scale, height * scale) != 0)
		{
			throw Napi::Error::New(env, std::string("Cannot set the render scale: ") + SDL_GetError());
		}
		handle_events(env);
		return env.Undefined();
	}

	Napi::Value on_click(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		on_click_callback_ref = Napi::Persistent(info[0].As<Napi::Function>());
		return env.Undefined();
	}

	inline Napi::Value on_keydown(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		on_keydown_callback_ref = Napi::Persistent(info[0].As<Napi::Function>());
		return env.Undefined();
	}

	inline Napi::Value on_keyup(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		on_keyup_callback_ref = Napi::Persistent(info[0].As<Napi::Function>());
		return env.Undefined();
	}

	inline Napi::Value on_keysdown(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		on_keysdown_callback_ref = Napi::Persistent(info[0].As<Napi::Function>());
		return env.Undefined();
	}

	inline Napi::Value on_keysup(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		on_keysup_callback_ref = Napi::Persistent(info[0].As<Napi::Function>());
		return env.Undefined();
	}

	inline Napi::Value get_ticks(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		return Napi::Number::New(env, SDL_GetTicks());
	}

	Napi::Value set_antialias(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		antialiasing = true;
		return env.Undefined();
	}

	inline Napi::Value set_font(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		current_font = TTF_OpenFont(info[0].As<Napi::String>().Utf8Value().c_str(), info[1].As<Napi::Number>().Int32Value());
		return env.Undefined();
	}

	Napi::Value get_screen_resolution(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_DisplayMode mode;
		SDL_GetDesktopDisplayMode(0, &mode);
		Napi::Object res = Napi::Object::New(env);
		res.Set(Napi::String::New(env, "w"), Napi::Number::New(env, mode.w));
		res.Set(Napi::String::New(env, "h"), Napi::Number::New(env, mode.h));
		return res;
	}

	Napi::Value draw_text(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		SDL_Renderer *renderer = GET_RENDERER;
		SDL_Color color = {
			static_cast<Uint8>(info[2].As<Napi::Number>().Uint32Value()),
			static_cast<Uint8>(info[3].As<Napi::Number>().Uint32Value()),
			static_cast<Uint8>(info[4].As<Napi::Number>().Uint32Value())};
		SDL_Surface *surface = TTF_RenderText_Solid(current_font, info[1].As<Napi::String>().Utf8Value().c_str(), color);

		SDL_Texture *texture = SDL_CreateTextureFromSurface(renderer, surface);
		int texW = 0;
		int texH = 0;
		int x = info[5].As<Napi::Number>().Int32Value();
		int y = info[6].As<Napi::Number>().Int32Value();
		SDL_QueryTexture(texture, NULL, NULL, &texW, &texH);
		SDL_Rect dstrect = {x, y, texW, texH};
		SDL_RenderCopy(renderer, texture, NULL, &dstrect);
		handle_events(env);
		return env.Undefined();
	}

	Napi::Value draw_arc(const Napi::CallbackInfo &info)
	{
		Napi::Env env = info.Env();
		const float precision = (float)0.1;
		SDL_Renderer *renderer = GET_RENDERER;
		int x = info[1].As<Napi::Number>().Int32Value();
		int y = info[2].As<Napi::Number>().Int32Value();
		int radius = info[3].As<Napi::Number>().Int32Value();
		float angle1 = info[4].As<Napi::Number>().FloatValue();
		float angle2 = info[5].As<Napi::Number>().FloatValue();
		Position pos = from_angle(x, y, angle1, radius), temp;
		while (angle1 < angle2)
		{
			angle1 += precision;
			temp = from_angle(x, y, angle1, radius);
			if (antialiasing)
			{
				SDL_RenderDrawLine(renderer, pos.x, pos.y, temp.x, temp.y);
			}
			else
			{
				SDL_RenderDrawLine(renderer, pos.x, pos.y, temp.x, temp.y);
			}
			pos = temp;
		}
		return env.Undefined();
	}
}