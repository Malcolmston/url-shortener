#ifndef CONVERT_H
#define CONVERT_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <unistd.h>
#include <sys/stat.h>

// Structure to hold conversion options
typedef struct {
    char *input_file;
    char *output_file;
    char *input_format;
    char *output_format;
    int quality;  // For lossy formats (JPEG, MP3, etc.)
    int width, height;  // For image resizing
} ConvertOptions;

// Media type categories
typedef enum {
    MEDIA_TEXT,
    MEDIA_IMAGE,
    MEDIA_AUDIO,
    MEDIA_VIDEO,
    MEDIA_DOCUMENT,
    MEDIA_ARCHIVE,
    MEDIA_UNKNOWN
} MediaType;

// Core utility functions
void print_usage(const char *program_name);
void print_debug_info(void);
void parse_arguments(int argc, char *argv[], ConvertOptions *opts);
char* get_file_extension(const char *filename);
char* detect_mime_type(const char *filename);
MediaType get_media_type(const char *mime_type);
int is_compatible_conversion(const char *input_mime, const char *output_mime);
void cleanup_options(ConvertOptions *opts);

// System utility functions
int command_exists(const char *command);
int has_heif_support(void);
int imagemagick_supports_format(const char *format);

// Text conversion functions
int convert_text_files(const char *input, const char *output);
int convert_csv_to_tsv(const char *input, const char *output);
int convert_tsv_to_csv(const char *input, const char *output);

// Image conversion functions
int convert_images(const char *input, const char *output, ConvertOptions *opts);
int convert_heic_with_libheif(const char *input, const char *output, ConvertOptions *opts);
int convert_to_heic_with_libheif(const char *input, const char *output, ConvertOptions *opts);

// Audio/Video conversion functions
int convert_audio(const char *input, const char *output, ConvertOptions *opts);
int convert_video(const char *input, const char *output, ConvertOptions *opts);

// Document conversion functions
int convert_documents(const char *input, const char *output);

// Archive conversion functions
int convert_archives(const char *input, const char *output);

// File utility functions
int copy_file(const char *input, const char *output);

// Version and build information
#define CONVERT_VERSION "1.0.1"
#define CONVERT_BUILD_DATE __DATE__

// Default values
#define DEFAULT_QUALITY 85
#define DEFAULT_OUTPUT_DIR "converted"
#define TEMP_DIR_TEMPLATE "/tmp/convert_XXXXXX"

// Maximum path lengths
#define MAX_PATH_LENGTH 4096
#define MAX_COMMAND_LENGTH 8192
#define MAX_EXTENSION_LENGTH 32

// Error codes
#define CONVERT_SUCCESS 0
#define CONVERT_ERROR_ARGS 1
#define CONVERT_ERROR_FILE_NOT_FOUND 2
#define CONVERT_ERROR_UNSUPPORTED_FORMAT 3
#define CONVERT_ERROR_CONVERSION_FAILED 4
#define CONVERT_ERROR_TOOL_NOT_FOUND 5

#endif // CONVERT_H
