#include "convert.h"

void print_usage(const char *program_name) {
    printf("Convert v%s (built %s)\n", CONVERT_VERSION, CONVERT_BUILD_DATE);
    printf("Usage: %s -in <input_file> -out <output_file> [options]\n", program_name);
    printf("\nOptions:\n");
    printf("  -in <file>     Input file path\n");
    printf("  -out <file>    Output file path\n");
    printf("  -q <quality>   Quality for lossy formats (1-100, default: 85)\n");
    printf("  -w <width>     Target width for images\n");
    printf("  -h <height>    Target height for images\n");
    printf("  --help         Show this help message\n");
    printf("  --debug        Show available conversion tools\n");

    printf("\nSupported conversions:\n");
    printf("  Text files:     .txt, .md, .rst, .csv, .tsv, .json, .xml\n");
    printf("  Images:         .jpg, .jpeg, .png, .gif, .bmp, .tiff, .webp, .heic, .heif\n");
    printf("  Audio:          .mp3, .wav, .flac, .ogg, .aac, .m4a\n");
    printf("  Video:          .mp4, .avi, .mkv, .mov, .wmv, .flv, .webm\n");
    printf("  Documents:      .pdf, .doc, .docx, .odt, .rtf, .html\n");
    printf("  Archives:       .zip, .tar, .gz, .bz2, .7z, .rar\n");

    printf("\nExamples:\n");
    printf("  %s -in photo.png -out photo.jpg -q 90\n", program_name);
    printf("  %s -in photo.heic -out photo.webp -q 85\n", program_name);
    printf("  %s -in music.flac -out music.mp3 -q 320\n", program_name);
    printf("  %s -in video.avi -out video.mp4\n", program_name);
    printf("  %s -in document.docx -out document.pdf\n", program_name);

    printf("\nNote: macOS-optimized with native tools:\n");
    printf("  Images: SIPS (native) + ImageMagick fallback\n");
    printf("  Audio/Video: FFmpeg\n");
    printf("  Documents: LibreOffice + Pandoc fallback\n");
    printf("  Archives: p7zip, unrar, native tar/gzip\n");

    printf("\nInstall dependencies on macOS:\n");
    printf("  brew install imagemagick ffmpeg p7zip unrar libheif\n");
    printf("  brew install --cask libreoffice\n");
    printf("  brew install pandoc  # optional for document conversion\n");
}

// Check if ImageMagick supports a specific format
int imagemagick_supports_format(const char *format) {
    char command[256];
    snprintf(command, sizeof(command), "convert -list format | grep -i %s > /dev/null 2>&1", format);
    return system(command) == 0;
}

void print_debug_info(void) {
    printf("=== Debug: Available Conversion Tools ===\n");

    printf("\nImage Tools:\n");
    printf("  SIPS (macOS):     %s\n", command_exists("sips") ? "✓ Available" : "✗ Not found");

    if (command_exists("magick")) {
        printf("  ImageMagick:      ✓ Available (magick)\n");
    } else if (command_exists("convert")) {
        printf("  ImageMagick:      ✓ Available (convert)\n");
    } else {
        printf("  ImageMagick:      ✗ Not found\n");
    }

    if (command_exists("magick") || command_exists("convert")) {
        const char *cmd = command_exists("magick") ? "magick" : "convert";
        char test_cmd[256];

        snprintf(test_cmd, sizeof(test_cmd), "%s -list format | grep -i webp > /dev/null 2>&1", cmd);
        printf("    WebP support:   %s\n", system(test_cmd) == 0 ? "✓ Available" : "✗ Not found");

        snprintf(test_cmd, sizeof(test_cmd), "%s -list format | grep -i heic > /dev/null 2>&1", cmd);
        printf("    HEIC support:   %s\n", system(test_cmd) == 0 ? "✓ Available" : "✗ Not found");

        snprintf(test_cmd, sizeof(test_cmd), "%s -list format | grep -i bmp > /dev/null 2>&1", cmd);
        printf("    BMP support:    %s\n", system(test_cmd) == 0 ? "✓ Available" : "✗ Not found");
    }

    printf("  libheif tools:    %s\n", has_heif_support() ? "✓ Available" : "✗ Not found");
    printf("    heif-convert:   %s\n", command_exists("heif-convert") ? "✓ Available" : "✗ Not found");
    printf("    heif-enc:       %s\n", command_exists("heif-enc") ? "✓ Available" : "✗ Not found");
    printf("    heif-dec:       %s\n", command_exists("heif-dec") ? "✓ Available" : "✗ Not found");

    printf("\nAudio/Video Tools:\n");
    printf("  FFmpeg:           %s\n", command_exists("ffmpeg") ? "✓ Available" : "✗ Not found");

    printf("\nDocument Tools:\n");
    printf("  LibreOffice:      %s\n", command_exists("libreoffice") ? "✓ Available" : "✗ Not found");
    printf("  soffice:          %s\n", command_exists("soffice") ? "✓ Available" : "✗ Not found");
    printf("  Pandoc:           %s\n", command_exists("pandoc") ? "✓ Available" : "✗ Not found");

    printf("\nArchive Tools:\n");
    printf("  7z:               %s\n", command_exists("7z") ? "✓ Available" : "✗ Not found");
    printf("  unar (RAR):       %s\n", command_exists("unar") ? "✓ Available" : "✗ Not found");
    printf("  unzip:            %s\n", command_exists("unzip") ? "✓ Available" : "✗ Not found");
    printf("  tar:              %s\n", command_exists("tar") ? "✓ Available" : "✗ Not found");

    printf("\n=== End Debug Info ===\n");
}

void parse_arguments(int argc, char *argv[], ConvertOptions *opts) {
    // Initialize options with defaults
    memset(opts, 0, sizeof(ConvertOptions));
    opts->quality = DEFAULT_QUALITY;  // Default quality
    opts->width = -1;    // No resizing by default
    opts->height = -1;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-in") == 0) {
            if (i + 1 < argc) {
                opts->input_file = strdup(argv[++i]);
            } else {
                fprintf(stderr, "Error: -in flag requires a filename\n");
                exit(CONVERT_ERROR_ARGS);
            }
        } else if (strcmp(argv[i], "-out") == 0) {
            if (i + 1 < argc) {
                opts->output_file = strdup(argv[++i]);
            } else {
                fprintf(stderr, "Error: -out flag requires a filename\n");
                exit(CONVERT_ERROR_ARGS);
            }
        } else if (strcmp(argv[i], "-q") == 0) {
            if (i + 1 < argc) {
                opts->quality = atoi(argv[++i]);
                if (opts->quality < 1 || opts->quality > 100) {
                    fprintf(stderr, "Error: Quality must be between 1-100\n");
                    exit(CONVERT_ERROR_ARGS);
                }
            } else {
                fprintf(stderr, "Error: -q flag requires a quality value\n");
                exit(CONVERT_ERROR_ARGS);
            }
        } else if (strcmp(argv[i], "-w") == 0) {
            if (i + 1 < argc) {
                opts->width = atoi(argv[++i]);
            } else {
                fprintf(stderr, "Error: -w flag requires a width value\n");
                exit(CONVERT_ERROR_ARGS);
            }
        } else if (strcmp(argv[i], "-h") == 0 && i + 1 < argc &&
                   (argv[i+1][0] >= '0' && argv[i+1][0] <= '9')) {
            // Height parameter (not help)
            opts->height = atoi(argv[++i]);
        } else if (strcmp(argv[i], "--help") == 0) {
            print_usage(argv[0]);
            exit(CONVERT_SUCCESS);
        } else if (strcmp(argv[i], "--debug") == 0) {
            print_debug_info();
            exit(CONVERT_SUCCESS);
        } else {
            fprintf(stderr, "Error: Unknown argument '%s'\n", argv[i]);
            print_usage(argv[0]);
            exit(CONVERT_ERROR_ARGS);
        }
    }

    if (!opts->input_file || !opts->output_file) {
        fprintf(stderr, "Error: Both -in and -out flags are required\n");
        print_usage(argv[0]);
        exit(CONVERT_ERROR_ARGS);
    }
}

char* get_file_extension(const char *filename) {
    char *dot = strrchr(filename, '.');
    if (!dot || dot == filename) return "";
    return dot + 1;
}

char* detect_mime_type(const char *filename) {
    char *ext = get_file_extension(filename);
    char lower_ext[32];

    // Convert extension to lowercase
    strncpy(lower_ext, ext, sizeof(lower_ext) - 1);
    lower_ext[sizeof(lower_ext) - 1] = '\0';
    for (char *p = lower_ext; *p; ++p) *p = tolower(*p);

    // Debug output
    printf("Debug: Detecting MIME type for extension '%s'\n", lower_ext);

    // Text formats
    if (strcmp(lower_ext, "txt") == 0) return "text/plain";
    if (strcmp(lower_ext, "md") == 0) return "text/markdown";
    if (strcmp(lower_ext, "rst") == 0) return "text/x-rst";
    if (strcmp(lower_ext, "csv") == 0) return "text/csv";
    if (strcmp(lower_ext, "tsv") == 0) return "text/tab-separated-values";
    if (strcmp(lower_ext, "json") == 0) return "application/json";
    if (strcmp(lower_ext, "xml") == 0) return "application/xml";
    if (strcmp(lower_ext, "html") == 0 || strcmp(lower_ext, "htm") == 0) return "text/html";

    // Image formats
    if (strcmp(lower_ext, "jpg") == 0 || strcmp(lower_ext, "jpeg") == 0) return "image/jpeg";
    if (strcmp(lower_ext, "png") == 0) return "image/png";
    if (strcmp(lower_ext, "gif") == 0) return "image/gif";
    if (strcmp(lower_ext, "bmp") == 0) return "image/bmp";
    if (strcmp(lower_ext, "tiff") == 0 || strcmp(lower_ext, "tif") == 0) return "image/tiff";
    if (strcmp(lower_ext, "webp") == 0) return "image/webp";  // Fixed: Added WebP support
    if (strcmp(lower_ext, "heic") == 0) return "image/heic";
    if (strcmp(lower_ext, "heif") == 0) return "image/heif";
    if (strcmp(lower_ext, "svg") == 0) return "image/svg+xml";

    // Audio formats
    if (strcmp(lower_ext, "mp3") == 0) return "audio/mpeg";
    if (strcmp(lower_ext, "wav") == 0) return "audio/wav";
    if (strcmp(lower_ext, "flac") == 0) return "audio/flac";
    if (strcmp(lower_ext, "ogg") == 0) return "audio/ogg";
    if (strcmp(lower_ext, "aac") == 0) return "audio/aac";
    if (strcmp(lower_ext, "m4a") == 0) return "audio/mp4";

    // Video formats
    if (strcmp(lower_ext, "mp4") == 0) return "video/mp4";
    if (strcmp(lower_ext, "avi") == 0) return "video/x-msvideo";
    if (strcmp(lower_ext, "mkv") == 0) return "video/x-matroska";
    if (strcmp(lower_ext, "mov") == 0) return "video/quicktime";
    if (strcmp(lower_ext, "wmv") == 0) return "video/x-ms-wmv";
    if (strcmp(lower_ext, "flv") == 0) return "video/x-flv";
    if (strcmp(lower_ext, "webm") == 0) return "video/webm";

    // Document formats
    if (strcmp(lower_ext, "pdf") == 0) return "application/pdf";
    if (strcmp(lower_ext, "doc") == 0) return "application/msword";
    if (strcmp(lower_ext, "docx") == 0) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (strcmp(lower_ext, "odt") == 0) return "application/vnd.oasis.opendocument.text";
    if (strcmp(lower_ext, "rtf") == 0) return "application/rtf";

    // Archive formats
    if (strcmp(lower_ext, "zip") == 0) return "application/zip";
    if (strcmp(lower_ext, "tar") == 0) return "application/x-tar";
    if (strcmp(lower_ext, "gz") == 0) return "application/gzip";
    if (strcmp(lower_ext, "bz2") == 0) return "application/x-bzip2";
    if (strcmp(lower_ext, "7z") == 0) return "application/x-7z-compressed";
    if (strcmp(lower_ext, "rar") == 0) return "application/x-rar-compressed";

    printf("Debug: Unknown extension '%s', returning default MIME type\n", lower_ext);
    return "application/octet-stream";
}

MediaType get_media_type(const char *mime_type) {
    printf("Debug: Getting media type for MIME '%s'\n", mime_type);

    if (strncmp(mime_type, "text/", 5) == 0 ||
        strncmp(mime_type, "application/json", 16) == 0 ||
        strncmp(mime_type, "application/xml", 15) == 0) {
        return MEDIA_TEXT;
    }
    if (strncmp(mime_type, "image/", 6) == 0) {
        return MEDIA_IMAGE;
    }
    if (strncmp(mime_type, "audio/", 6) == 0) {
        return MEDIA_AUDIO;
    }
    if (strncmp(mime_type, "video/", 6) == 0) {
        return MEDIA_VIDEO;
    }
    if (strstr(mime_type, "pdf") || strstr(mime_type, "word") ||
        strstr(mime_type, "opendocument") || strstr(mime_type, "rtf")) {
        return MEDIA_DOCUMENT;
    }
    if (strstr(mime_type, "zip") || strstr(mime_type, "tar") ||
        strstr(mime_type, "gzip") || strstr(mime_type, "bzip") ||
        strstr(mime_type, "7z") || strstr(mime_type, "rar")) {
        return MEDIA_ARCHIVE;
    }
    return MEDIA_UNKNOWN;
}

int is_compatible_conversion(const char *input_mime, const char *output_mime) {
    MediaType input_type = get_media_type(input_mime);
    MediaType output_type = get_media_type(output_mime);

    printf("Debug: Checking compatibility - Input: %s (%d) -> Output: %s (%d)\n",
           input_mime, input_type, output_mime, output_type);

    // Same type conversions are generally compatible
    if (input_type == output_type && input_type != MEDIA_UNKNOWN) {
        return 1;
    }

    // Some cross-type conversions are possible
    if ((input_type == MEDIA_TEXT && output_type == MEDIA_DOCUMENT) ||
        (input_type == MEDIA_DOCUMENT && output_type == MEDIA_TEXT)) {
        return 1;
    }

    // For unknown types, be more permissive and try the conversion anyway
    if (input_type == MEDIA_UNKNOWN || output_type == MEDIA_UNKNOWN) {
        printf("Debug: Unknown media type detected, allowing conversion attempt\n");
        return 1;
    }

    return 0;
}

// Check if a command exists in PATH
int command_exists(const char *command) {
    char check_cmd[256];
    snprintf(check_cmd, sizeof(check_cmd), "which %s > /dev/null 2>&1", command);
    return system(check_cmd) == 0;
}

// Check if libheif tools are available
int has_heif_support(void) {
    return command_exists("heif-convert") || command_exists("heif-enc") || command_exists("heif-dec");
}

// Convert HEIC/HEIF files using libheif tools
int convert_heic_with_libheif(const char *input, const char *output, ConvertOptions *opts) {
    char command[1024];
    char *output_ext = get_file_extension(output);
    for (char *p = output_ext; *p; ++p) *p = tolower(*p);

    // Check what formats heif-convert supports
    if (command_exists("heif-convert")) {
        // heif-convert typically supports: jpg, png, y4m
        // For other formats like webp, bmp, etc., we need to use two-step conversion
        if (strcmp(output_ext, "jpg") == 0 || strcmp(output_ext, "jpeg") == 0 ||
            strcmp(output_ext, "png") == 0 || strcmp(output_ext, "y4m") == 0) {
            // Direct conversion for supported formats
            snprintf(command, sizeof(command), "heif-convert \"%s\" \"%s\"", input, output);
            printf("Executing (libheif direct): %s\n", command);
            return system(command) == 0;
        } else {
            // Two-step conversion for unsupported formats (webp, bmp, tiff, etc.)
            printf("heif-convert doesn't support %s format directly, using two-step conversion...\n", output_ext);

            // First convert HEIC to PNG
            char temp_png[512];
            snprintf(temp_png, sizeof(temp_png), "/tmp/heic_temp_%d.png", getpid());

            snprintf(command, sizeof(command), "heif-convert \"%s\" \"%s\"", input, temp_png);
            printf("Step 1 - HEIC to PNG: %s\n", command);

            if (system(command) != 0) {
                printf("Failed to convert HEIC to PNG\n");
                return 0;
            }

            // Then convert PNG to target format using ImageMagick
            if (command_exists("magick") || command_exists("convert")) {
                const char *convert_cmd = command_exists("magick") ? "magick" : "convert";
                snprintf(command, sizeof(command), "%s \"%s\"", convert_cmd, temp_png);

                // Add quality setting for lossy formats
                if (strcmp(output_ext, "jpg") == 0 || strcmp(output_ext, "jpeg") == 0 ||
                    strcmp(output_ext, "webp") == 0) {
                    char quality_str[32];
                    snprintf(quality_str, sizeof(quality_str), " -quality %d", opts->quality);
                    strcat(command, quality_str);
                }

                // Add resize if specified
                if (opts->width > 0 && opts->height > 0) {
                    char resize_str[64];
                    snprintf(resize_str, sizeof(resize_str), " -resize %dx%d", opts->width, opts->height);
                    strcat(command, resize_str);
                } else if (opts->width > 0) {
                    char resize_str[64];
                    snprintf(resize_str, sizeof(resize_str), " -resize %dx", opts->width);
                    strcat(command, resize_str);
                } else if (opts->height > 0) {
                    char resize_str[64];
                    snprintf(resize_str, sizeof(resize_str), " -resize x%d", opts->height);
                    strcat(command, resize_str);
                }

                char output_str[512];
                snprintf(output_str, sizeof(output_str), " \"%s\"", output);
                strcat(command, output_str);

                printf("Step 2 - PNG to %s: %s\n", output_ext, command);
                int result = system(command);

                // Clean up temp file
                unlink(temp_png);
                return result == 0;
            } else {
                printf("ImageMagick not found for second conversion step\n");
                unlink(temp_png);
                return 0;
            }
        }
    }

    // Alternative: use heif-dec + convert pipeline
    if (command_exists("heif-dec") && (command_exists("convert") || command_exists("magick"))) {
        printf("Using heif-dec + ImageMagick pipeline...\n");

        // First decode HEIC to PNG
        char temp_png[512];
        snprintf(temp_png, sizeof(temp_png), "/tmp/heic_temp_%d.png", getpid());

        snprintf(command, sizeof(command), "heif-dec \"%s\" \"%s\"", input, temp_png);
        printf("Step 1 - HEIC decode: %s\n", command);

        if (system(command) != 0) {
            return 0;
        }

        // Then convert PNG to target format
        const char *convert_cmd = command_exists("magick") ? "magick" : "convert";
        snprintf(command, sizeof(command), "%s \"%s\"", convert_cmd, temp_png);

        // Add quality setting for lossy formats
        if (strcmp(output_ext, "jpg") == 0 || strcmp(output_ext, "jpeg") == 0 ||
            strcmp(output_ext, "webp") == 0) {
            char quality_str[32];
            snprintf(quality_str, sizeof(quality_str), " -quality %d", opts->quality);
            strcat(command, quality_str);
        }

        // Add resize if specified
        if (opts->width > 0 && opts->height > 0) {
            char resize_str[64];
            snprintf(resize_str, sizeof(resize_str), " -resize %dx%d", opts->width, opts->height);
            strcat(command, resize_str);
        }

        char output_str[512];
        snprintf(output_str, sizeof(output_str), " \"%s\"", output);
        strcat(command, output_str);

        printf("Step 2 - PNG to %s: %s\n", output_ext, command);
        int result = system(command);

        // Clean up temp file
        unlink(temp_png);
        return result == 0;
    }

    return 0;
}

// Convert TO HEIC format using libheif
int convert_to_heic_with_libheif(const char *input, const char *output, ConvertOptions *opts) {
    char command[1024];

    if (command_exists("heif-enc")) {
        snprintf(command, sizeof(command), "heif-enc");

        // Add quality setting
        char quality_str[32];
        snprintf(quality_str, sizeof(quality_str), " -q %d", opts->quality);
        strcat(command, quality_str);

        // Add input and output
        char files_str[1024];
        snprintf(files_str, sizeof(files_str), " \"%s\" -o \"%s\"", input, output);
        strcat(command, files_str);

        printf("Executing (heif-enc): %s\n", command);
        return system(command) == 0;
    }

    return 0;
}

// Image conversion using SIPS (macOS native), ImageMagick, or libheif
int convert_images(const char *input, const char *output, ConvertOptions *opts) {
    char command[1024];
    char *input_ext = get_file_extension(input);
    char *output_ext = get_file_extension(output);

    // Convert extensions to lowercase
    for (char *p = input_ext; *p; ++p) *p = tolower(*p);
    for (char *p = output_ext; *p; ++p) *p = tolower(*p);

    printf("Debug: Converting image from '%s' to '%s'\n", input_ext, output_ext);

    // Handle HEIC/HEIF input files
    if (strcmp(input_ext, "heic") == 0 || strcmp(input_ext, "heif") == 0) {
        if (has_heif_support()) {
            printf("Converting HEIC using libheif tools...\n");
            return convert_heic_with_libheif(input, output, opts);
        } else if (command_exists("magick") || command_exists("convert")) {
            // Try ImageMagick directly (newer versions support HEIC)
            printf("Trying ImageMagick for HEIC conversion...\n");
            const char *magick_cmd = command_exists("magick") ? "magick" : "convert";
            snprintf(command, sizeof(command), "%s \"%s\"", magick_cmd, input);

            // Add quality setting for lossy formats
            if (strcmp(output_ext, "jpg") == 0 || strcmp(output_ext, "jpeg") == 0 ||
                strcmp(output_ext, "webp") == 0) {
                char quality_str[32];
                snprintf(quality_str, sizeof(quality_str), " -quality %d", opts->quality);
                strcat(command, quality_str);
            }

            // Add resize if specified
            if (opts->width > 0 && opts->height > 0) {
                char resize_str[64];
                snprintf(resize_str, sizeof(resize_str), " -resize %dx%d", opts->width, opts->height);
                strcat(command, resize_str);
            } else if (opts->width > 0) {
                char resize_str[64];
                snprintf(resize_str, sizeof(resize_str), " -resize %dx", opts->width);
                strcat(command, resize_str);
            } else if (opts->height > 0) {
                char resize_str[64];
                snprintf(resize_str, sizeof(resize_str), " -resize x%d", opts->height);
                strcat(command, resize_str);
            }

            // Add output file
            char output_str[512];
            snprintf(output_str, sizeof(output_str), " \"%s\"", output);
            strcat(command, output_str);

            printf("Executing (ImageMagick for HEIC): %s\n", command);
            int result = system(command);
            if (result == 0) {
                return 1;
            } else {
                printf("ImageMagick HEIC conversion failed\n");
            }
        } else {
            fprintf(stderr, "Error: HEIC/HEIF support requires libheif tools or ImageMagick with HEIC support\n");
            fprintf(stderr, "Install with: brew install libheif\n");
            fprintf(stderr, "This provides: heif-convert, heif-enc, heif-dec\n");
            return 0;
        }
    }

    // Handle HEIC/HEIF output files
    if (strcmp(output_ext, "heic") == 0 || strcmp(output_ext, "heif") == 0) {
        if (has_heif_support()) {
            printf("Converting to HEIC using libheif tools...\n");
            return convert_to_heic_with_libheif(input, output, opts);
        } else {
            fprintf(stderr, "Error: HEIC/HEIF support requires libheif tools\n");
            fprintf(stderr, "Install with: brew install libheif\n");
            fprintf(stderr, "This provides: heif-convert, heif-enc, heif-dec\n");
            return 0;
        }
    }

    // Try ImageMagick first (better WebP support and more formats)
    if (command_exists("magick") || command_exists("convert")) {
        const char *magick_cmd = command_exists("magick") ? "magick" : "convert";
        snprintf(command, sizeof(command), "%s \"%s\"", magick_cmd, input);

        // Add quality setting for lossy formats
        if (strcmp(output_ext, "jpg") == 0 || strcmp(output_ext, "jpeg") == 0 ||
            strcmp(output_ext, "webp") == 0) {
            char quality_str[32];
            snprintf(quality_str, sizeof(quality_str), " -quality %d", opts->quality);
            strcat(command, quality_str);
        }

        // Add resize if specified
        if (opts->width > 0 && opts->height > 0) {
            char resize_str[64];
            snprintf(resize_str, sizeof(resize_str), " -resize %dx%d", opts->width, opts->height);
            strcat(command, resize_str);
        } else if (opts->width > 0) {
            char resize_str[64];
            snprintf(resize_str, sizeof(resize_str), " -resize %dx", opts->width);
            strcat(command, resize_str);
        } else if (opts->height > 0) {
            char resize_str[64];
            snprintf(resize_str, sizeof(resize_str), " -resize x%d", opts->height);
            strcat(command, resize_str);
        }

        // Add output file
        char output_str[512];
        snprintf(output_str, sizeof(output_str), " \"%s\"", output);
        strcat(command, output_str);

        printf("Executing (ImageMagick): %s\n", command);
        int result = system(command);
        if (result == 0) {
            return 1;
        } else {
            printf("ImageMagick failed with exit code %d, trying SIPS...\n", result);
        }
    }

    // Try SIPS as fallback (macOS native tool) - but skip for WebP
    if (command_exists("sips") && strcmp(output_ext, "webp") != 0 && strcmp(input_ext, "webp") != 0) {
        printf("Trying SIPS (macOS native)...\n");
        snprintf(command, sizeof(command), "sips -s format %s", output_ext);

        // Add quality setting for JPEG
        if (strcmp(output_ext, "jpg") == 0 || strcmp(output_ext, "jpeg") == 0) {
            char quality_str[32];
            // SIPS uses quality as percentage (0.0-1.0), convert from 1-100
            float quality = opts->quality / 100.0f;
            snprintf(quality_str, sizeof(quality_str), " -s formatOptions %.2f", quality);
            strcat(command, quality_str);
        }

        // Add resize if specified
        if (opts->width > 0 && opts->height > 0) {
            char resize_str[64];
            snprintf(resize_str, sizeof(resize_str), " -z %d %d", opts->width, opts->height);
            strcat(command, resize_str);
        } else if (opts->width > 0) {
            char resize_str[64];
            snprintf(resize_str, sizeof(resize_str), " -Z %d", opts->width);
            strcat(command, resize_str);
        } else if (opts->height > 0) {
            char resize_str[64];
            snprintf(resize_str, sizeof(resize_str), " --resampleHeight %d", opts->height);
            strcat(command, resize_str);
        }

        // Add input and output files
        char files_str[1024];
        snprintf(files_str, sizeof(files_str), " \"%s\" --out \"%s\"", input, output);
        strcat(command, files_str);

        printf("Executing (SIPS): %s\n", command);
        return system(command) == 0;
    }

    fprintf(stderr, "Error: No suitable image conversion tool found for this format\n");

    if (strcmp(output_ext, "webp") == 0 || strcmp(input_ext, "webp") == 0) {
        fprintf(stderr, "For WebP support, ensure ImageMagick is installed with WebP support:\n");
        fprintf(stderr, "  brew install imagemagick\n");
        fprintf(stderr, "  brew install webp  # for additional WebP tools\n");
    }

    if (strcmp(input_ext, "heic") == 0 || strcmp(input_ext, "heif") == 0) {
        fprintf(stderr, "For HEIC support, install: brew install libheif\n");
    }

    return 0;
}

// Audio conversion using FFmpeg
int convert_audio(const char *input, const char *output, ConvertOptions *opts) {
    char command[1024];

    if (!command_exists("ffmpeg")) {
        fprintf(stderr, "Error: FFmpeg not found. Install with: brew install ffmpeg\n");
        return 0;
    }

    snprintf(command, sizeof(command), "ffmpeg -i \"%s\"", input);

    // Add quality/bitrate settings
    char *output_ext = get_file_extension(output);
    for (char *p = output_ext; *p; ++p) *p = tolower(*p);

    if (strcmp(output_ext, "mp3") == 0) {
        char quality_str[32];
        snprintf(quality_str, sizeof(quality_str), " -b:a %dk", opts->quality * 3); // Convert quality to kbps
        strcat(command, quality_str);
    }

    // Add output file and overwrite flag
    char output_str[512];
    snprintf(output_str, sizeof(output_str), " -y \"%s\"", output);
    strcat(command, output_str);

    printf("Executing: %s\n", command);
    return system(command) == 0;
}

// Video conversion using FFmpeg
int convert_video(const char *input, const char *output, ConvertOptions *opts) {
    char command[1024];

    if (!command_exists("ffmpeg")) {
        fprintf(stderr, "Error: FFmpeg not found. Install with: brew install ffmpeg\n");
        return 0;
    }

    snprintf(command, sizeof(command), "ffmpeg -i \"%s\"", input);

    // Add quality settings
    if (opts->quality < 85) {
        strcat(command, " -crf 28"); // Lower quality
    } else {
        strcat(command, " -crf 18"); // Higher quality
    }

    // Add resize if specified
    if (opts->width > 0 && opts->height > 0) {
        char resize_str[64];
        snprintf(resize_str, sizeof(resize_str), " -vf scale=%d:%d", opts->width, opts->height);
        strcat(command, resize_str);
    }

    // Add output file and overwrite flag
    char output_str[512];
    snprintf(output_str, sizeof(output_str), " -y \"%s\"", output);
    strcat(command, output_str);

    printf("Executing: %s\n", command);
    return system(command) == 0;
}

// Document conversion using LibreOffice (with macOS path detection)
int convert_documents(const char *input, const char *output) {
    char command[1024];
    char *output_dir = strdup(output);
    char *last_slash = strrchr(output_dir, '/');
    if (last_slash) {
        *last_slash = '\0';
    } else {
        strcpy(output_dir, ".");
    }

    const char *libreoffice_cmd = NULL;

    // Check for LibreOffice in different locations
    if (command_exists("libreoffice")) {
        libreoffice_cmd = "libreoffice";
    } else if (command_exists("soffice")) {
        libreoffice_cmd = "soffice";
    } else {
        // Try macOS application path
        if (access("/Applications/LibreOffice.app/Contents/MacOS/soffice", X_OK) == 0) {
            libreoffice_cmd = "/Applications/LibreOffice.app/Contents/MacOS/soffice";
        }
    }

    if (!libreoffice_cmd) {
        // Try pandoc as fallback for some document conversions
        if (command_exists("pandoc")) {
            char *input_ext = get_file_extension(input);
            char *output_ext = get_file_extension(output);

            // Convert extensions to lowercase
            for (char *p = input_ext; *p; ++p) *p = tolower(*p);
            for (char *p = output_ext; *p; ++p) *p = tolower(*p);

            // Check if pandoc can handle this conversion
            if ((strcmp(input_ext, "md") == 0 || strcmp(input_ext, "html") == 0 ||
                 strcmp(input_ext, "txt") == 0 || strcmp(input_ext, "rtf") == 0) &&
                (strcmp(output_ext, "pdf") == 0 || strcmp(output_ext, "html") == 0 ||
                 strcmp(output_ext, "docx") == 0 || strcmp(output_ext, "md") == 0)) {

                snprintf(command, sizeof(command), "pandoc \"%s\" -o \"%s\"", input, output);
                printf("Executing (Pandoc): %s\n", command);
                int result = system(command);
                free(output_dir);
                return result == 0;
            }
        }

        fprintf(stderr, "Error: LibreOffice not found. Install with: brew install --cask libreoffice\n");
        free(output_dir);
        return 0;
    }

    snprintf(command, sizeof(command),
             "\"%s\" --headless --convert-to %s --outdir \"%s\" \"%s\"",
             libreoffice_cmd, get_file_extension(output), output_dir, input);

    printf("Executing (LibreOffice): %s\n", command);
    int result = system(command);

    free(output_dir);
    return result == 0;
}

// Archive conversion with p7zip and unrar support
int convert_archives(const char *input, const char *output) {
    char *input_ext = get_file_extension(input);
    char *output_ext = get_file_extension(output);
    char command[1024];

    // Convert extensions to lowercase
    for (char *p = input_ext; *p; ++p) *p = tolower(*p);
    for (char *p = output_ext; *p; ++p) *p = tolower(*p);

    // Create temporary directory for extraction
    char temp_dir[] = "/tmp/convert_XXXXXX";
    if (mkdtemp(temp_dir) == NULL) {
        fprintf(stderr, "Error: Could not create temporary directory\n");
        return 0;
    }

    printf("Using temporary directory: %s\n", temp_dir);

    // Step 1: Extract the input archive
    int extract_success = 0;

    if (strcmp(input_ext, "zip") == 0) {
        if (command_exists("unzip")) {
            snprintf(command, sizeof(command), "unzip -q \"%s\" -d \"%s\"", input, temp_dir);
            extract_success = (system(command) == 0);
        }
    } else if (strcmp(input_ext, "rar") == 0) {
        if (command_exists("unar")) {
            // macOS: use unar
            snprintf(command, sizeof(command), "unar \"%s\" -o \"%s\"", input, temp_dir);
            extract_success = (system(command) == 0);
        } else if (command_exists("unrar")) {
            // Linux/other: use unrar
            snprintf(command, sizeof(command), "unrar x -y \"%s\" \"%s/\"", input, temp_dir);
            extract_success = (system(command) == 0);
        }
    } else if (strcmp(input_ext, "7z") == 0) {
        if (command_exists("7z")) {
            snprintf(command, sizeof(command), "7z x \"%s\" -o\"%s\" -y", input, temp_dir);
            extract_success = (system(command) == 0);
        }
    } else if (strcmp(input_ext, "tar") == 0) {
        snprintf(command, sizeof(command), "tar -xf \"%s\" -C \"%s\"", input, temp_dir);
        extract_success = (system(command) == 0);
    } else if (strcmp(input_ext, "gz") == 0) {
        // Check if it's a .tar.gz
        char *basename = strdup(input);
        char *dot = strrchr(basename, '.');
        if (dot) *dot = '\0';
        if (strstr(basename, ".tar")) {
            snprintf(command, sizeof(command), "tar -xzf \"%s\" -C \"%s\"", input, temp_dir);
        } else {
            snprintf(command, sizeof(command), "gunzip -c \"%s\" > \"%s/extracted\"", input, temp_dir);
        }
        extract_success = (system(command) == 0);
        free(basename);
    } else if (strcmp(input_ext, "bz2") == 0) {
        char *basename = strdup(input);
        char *dot = strrchr(basename, '.');
        if (dot) *dot = '\0';
        if (strstr(basename, ".tar")) {
            snprintf(command, sizeof(command), "tar -xjf \"%s\" -C \"%s\"", input, temp_dir);
        } else {
            snprintf(command, sizeof(command), "bunzip2 -c \"%s\" > \"%s/extracted\"", input, temp_dir);
        }
        extract_success = (system(command) == 0);
        free(basename);
    }

    if (!extract_success) {
        fprintf(stderr, "Error: Failed to extract %s archive\n", input_ext);
        snprintf(command, sizeof(command), "rm -rf \"%s\"", temp_dir);
        system(command);
        return 0;
    }

    printf("Extraction completed, creating %s archive...\n", output_ext);

    // Step 2: Create the output archive
    int compress_success = 0;

    if (strcmp(output_ext, "zip") == 0) {
        if (command_exists("zip")) {
            snprintf(command, sizeof(command), "cd \"%s\" && zip -r \"%s\" .", temp_dir, output);
            compress_success = (system(command) == 0);
        }
    } else if (strcmp(output_ext, "7z") == 0) {
        if (command_exists("7z")) {
            snprintf(command, sizeof(command), "7z a \"%s\" \"%s/*\"", output, temp_dir);
            compress_success = (system(command) == 0);
        }
    } else if (strcmp(output_ext, "tar") == 0) {
        snprintf(command, sizeof(command), "tar -cf \"%s\" -C \"%s\" .", output, temp_dir);
        compress_success = (system(command) == 0);
    } else if (strcmp(output_ext, "gz") == 0) {
        // Check if target should be .tar.gz
        if (strstr(output, ".tar.gz")) {
            snprintf(command, sizeof(command), "tar -czf \"%s\" -C \"%s\" .", output, temp_dir);
        } else {
            // Single file gzip - find the first file in temp_dir
            snprintf(command, sizeof(command), "find \"%s\" -type f -exec gzip -c {} \\; > \"%s\"", temp_dir, output);
        }
        compress_success = (system(command) == 0);
    } else if (strcmp(output_ext, "bz2") == 0) {
        if (strstr(output, ".tar.bz2")) {
            snprintf(command, sizeof(command), "tar -cjf \"%s\" -C \"%s\" .", output, temp_dir);
        } else {
            snprintf(command, sizeof(command), "find \"%s\" -type f -exec bzip2 -c {} \\; > \"%s\"", temp_dir, output);
        }
        compress_success = (system(command) == 0);
    }

    // Cleanup temporary directory
    snprintf(command, sizeof(command), "rm -rf \"%s\"", temp_dir);
    system(command);

    if (!compress_success) {
        fprintf(stderr, "Error: Failed to create %s archive\n", output_ext);
        return 0;
    }

    return 1;
}

int convert_csv_to_tsv(const char *input, const char *output) {
    FILE *in = fopen(input, "r");
    FILE *out = fopen(output, "w");

    if (!in || !out) {
        if (in) fclose(in);
        if (out) fclose(out);
        return 0;
    }

    char line[4096];
    while (fgets(line, sizeof(line), in)) {
        for (char *p = line; *p; p++) {
            if (*p == ',') *p = '\t';
        }
        fputs(line, out);
    }

    fclose(in);
    fclose(out);
    return 1;
}

int convert_tsv_to_csv(const char *input, const char *output) {
    FILE *in = fopen(input, "r");
    FILE *out = fopen(output, "w");

    if (!in || !out) {
        if (in) fclose(in);
        if (out) fclose(out);
        return 0;
    }

    char line[4096];
    while (fgets(line, sizeof(line), in)) {
        for (char *p = line; *p; p++) {
            if (*p == '\t') *p = ',';
        }
        fputs(line, out);
    }

    fclose(in);
    fclose(out);
    return 1;
}

int convert_text_files(const char *input, const char *output) {
    return copy_file(input, output);
}

int copy_file(const char *input, const char *output) {
    FILE *in = fopen(input, "rb");
    FILE *out = fopen(output, "wb");

    if (!in || !out) {
        if (in) fclose(in);
        if (out) fclose(out);
        return 0;
    }

    char buffer[4096];
    size_t bytes;

    while ((bytes = fread(buffer, 1, sizeof(buffer), in)) > 0) {
        if (fwrite(buffer, 1, bytes, out) != bytes) {
            fclose(in);
            fclose(out);
            return 0;
        }
    }

    fclose(in);
    fclose(out);
    return 1;
}

void cleanup_options(ConvertOptions *opts) {
    if (opts->input_file) free(opts->input_file);
    if (opts->output_file) free(opts->output_file);
    if (opts->input_format) free(opts->input_format);
    if (opts->output_format) free(opts->output_format);
}

int main(int argc, char *argv[]) {
    ConvertOptions opts;

    if (argc < 2) {
        print_usage(argv[0]);
        return CONVERT_ERROR_ARGS;
    }

    parse_arguments(argc, argv, &opts);

    // Check if input file exists
    if (access(opts.input_file, R_OK) != 0) {
        fprintf(stderr, "Error: Cannot read input file '%s'\n", opts.input_file);
        cleanup_options(&opts);
        return CONVERT_ERROR_FILE_NOT_FOUND;
    }

    // Detect MIME types
    char *input_mime = detect_mime_type(opts.input_file);
    char *output_mime = detect_mime_type(opts.output_file);

    printf("Converting '%s' (%s) to '%s' (%s)\n",
           opts.input_file, input_mime, opts.output_file, output_mime);

    // Check if conversion is supported
    if (!is_compatible_conversion(input_mime, output_mime)) {
        fprintf(stderr, "Error: Incompatible conversion from %s to %s\n",
                input_mime, output_mime);
        cleanup_options(&opts);
        return CONVERT_ERROR_UNSUPPORTED_FORMAT;
    }

    int success = 0;
    MediaType media_type = get_media_type(input_mime);

    printf("Debug: Media type determined as: %d\n", media_type);

    // Perform conversion based on media type
    switch (media_type) {
        case MEDIA_TEXT: {
            char *input_ext = get_file_extension(opts.input_file);
            char *output_ext = get_file_extension(opts.output_file);

            for (char *p = input_ext; *p; ++p) *p = tolower(*p);
            for (char *p = output_ext; *p; ++p) *p = tolower(*p);

            if (strcmp(input_ext, "csv") == 0 && strcmp(output_ext, "tsv") == 0) {
                success = convert_csv_to_tsv(opts.input_file, opts.output_file);
            } else if (strcmp(input_ext, "tsv") == 0 && strcmp(output_ext, "csv") == 0) {
                success = convert_tsv_to_csv(opts.input_file, opts.output_file);
            } else {
                success = convert_text_files(opts.input_file, opts.output_file);
            }
            break;
        }
        case MEDIA_IMAGE:
            success = convert_images(opts.input_file, opts.output_file, &opts);
            break;
        case MEDIA_AUDIO:
            success = convert_audio(opts.input_file, opts.output_file, &opts);
            break;
        case MEDIA_VIDEO:
            success = convert_video(opts.input_file, opts.output_file, &opts);
            break;
        case MEDIA_DOCUMENT:
            success = convert_documents(opts.input_file, opts.output_file);
            break;
        case MEDIA_ARCHIVE:
            success = convert_archives(opts.input_file, opts.output_file);
            break;
        default:
            fprintf(stderr, "Error: Unsupported media type for file '%s'\n", opts.input_file);

            // Try to determine if it's an image file and attempt image conversion anyway
            char *ext = get_file_extension(opts.input_file);
            for (char *p = ext; *p; ++p) *p = tolower(*p);

            if (strcmp(ext, "jpg") == 0 || strcmp(ext, "jpeg") == 0 ||
                strcmp(ext, "png") == 0 || strcmp(ext, "gif") == 0 ||
                strcmp(ext, "bmp") == 0 || strcmp(ext, "webp") == 0 ||
                strcmp(ext, "heic") == 0 || strcmp(ext, "heif") == 0) {
                printf("Attempting image conversion despite unknown media type...\n");
                success = convert_images(opts.input_file, opts.output_file, &opts);
            } else {
                cleanup_options(&opts);
                return CONVERT_ERROR_UNSUPPORTED_FORMAT;
            }
    }

    if (success) {
        printf("Conversion completed successfully!\n");
    } else {
        fprintf(stderr, "Error: Conversion failed\n");
        printf("Make sure you have the required tools installed:\n");
        printf("  Images: ImageMagick (brew install imagemagick)\n");
        printf("  Audio/Video: FFmpeg (brew install ffmpeg)\n");
        printf("  Documents: LibreOffice (brew install --cask libreoffice)\n");
        printf("  WebP support: Ensure ImageMagick has WebP support\n");
        printf("  HEIC support: libheif (brew install libheif)\n");
        cleanup_options(&opts);
        return CONVERT_ERROR_CONVERSION_FAILED;
    }

    cleanup_options(&opts);
    return CONVERT_SUCCESS;
}
