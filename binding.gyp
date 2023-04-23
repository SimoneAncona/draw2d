{
    'targets': [
        {
            'target_name': 'canvas_sdl2',
            'sources': ['src\\sdl2node.cpp'],
            'include_dirs': [
                "C:\\SDL\\SDL2-2.26.5\\include",
                "C:\\SDL_Image\\SDL2_image-2.6.3\\include",
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'dependencies': [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            'libraries': [
                "C:\\SDL\\SDL2-2.26.5\\lib\\x64\\SDL2.lib",
                "C:\\SDL_Image\\SDL2_image-2.6.3\\lib\\x64\\SDL2_image.lib"
            ],
            'cflags!': ['-fno-exceptions'],
            'cflags_cc!': ['-fno-exceptions'],
            'xcode_settings': {
                'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                'CLANG_CXX_LIBRARY': 'libc++',
                'MACOSX_DEPLOYMENT_TARGET': '10.7'
            },
            'msvs_settings': {
                'VCCLCompilerTool': {'ExceptionHandling': 1},
            }
        }
    ]
}
