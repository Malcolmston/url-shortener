# Makefile for convert program

# Compiler and flags
CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -O2
DEBUG_FLAGS = -g -DDEBUG
TARGET = convert
SOURCES = convert.c
HEADERS = convert.h

# Default target
all: $(TARGET)

# Build the main program
$(TARGET): $(SOURCES) $(HEADERS)
	$(CC) $(CFLAGS) -o ../$(TARGET) $(SOURCES)

# Debug build
debug: $(SOURCES) $(HEADERS)
	$(CC) $(CFLAGS) $(DEBUG_FLAGS) -o $(TARGET)-debug $(SOURCES)

# Clean build artifacts
clean:
	rm -f $(TARGET) $(TARGET)-debug *.o
	rm -rf test_files

# Install to /usr/local/bin (requires sudo)
install: $(TARGET)
	sudo cp $(TARGET) /usr/local/bin/
	sudo chmod +x /usr/local/bin/$(TARGET)

# Uninstall from /usr/local/bin
uninstall:
	sudo rm -f /usr/local/bin/$(TARGET)

# Test the program with sample conversions
test: $(TARGET)
	@echo "Testing convert program..."
	@echo "Creating test files..."
	@mkdir -p test_files
	@echo "This is a test file" > test_files/test.txt
	@echo "name,age,city" > test_files/test.csv
	@echo "John,25,NYC" >> test_files/test.csv
	@echo "Testing text file conversion..."
	./$(TARGET) -in test_files/test.txt -out test_files/test.md
	@echo "Testing CSV to TSV conversion..."
	./$(TARGET) -in test_files/test.csv -out test_files/test.tsv
	@echo "Test completed. Check test_files/ directory for results."

# Test HEIC conversion specifically
test-heic: $(TARGET)
	@echo "Testing HEIC conversion..."
	@if [ -f "test/IMG_1276.HEIC" ]; then \
		echo "Testing HEIC to JPG..."; \
		./$(TARGET) -in test/IMG_1276.HEIC -out test/test_output.jpg -q 90; \
		echo "Testing HEIC to WebP..."; \
		./$(TARGET) -in test/IMG_1276.HEIC -out test/test_output.webp -q 85; \
		echo "Testing HEIC to PNG..."; \
		./$(TARGET) -in test/IMG_1276.HEIC -out test/test_output.png; \
		echo "HEIC test completed. Check test/ directory for results."; \
	else \
		echo "No HEIC file found at test/IMG_1276.HEIC"; \
		echo "Place a HEIC file there to test HEIC conversion."; \
	fi

# Debug HEIC conversion
debug-heic: $(TARGET)
	@echo "Debug: Checking HEIC conversion tools..."
	./$(TARGET) --debug
	@echo ""
	@echo "Testing manual HEIC conversion steps..."
	@if [ -f "test/IMG_1276.HEIC" ]; then \
		echo "Step 1: HEIC to PNG using heif-convert"; \
		heif-convert test/IMG_1276.HEIC /tmp/debug_test.png; \
		echo "Step 2: PNG to WebP using ImageMagick"; \
		magick /tmp/debug_test.png /tmp/debug_test.webp; \
		echo "Files created:"; \
		ls -la /tmp/debug_test.*; \
		rm -f /tmp/debug_test.*; \
	else \
		echo "No HEIC file found for testing"; \
	fi

# Check for required dependencies
check-deps:
	@echo "Checking for required dependencies..."
	@command -v sips >/dev/null 2>&1 && echo "✓ SIPS (macOS native)" || echo "✗ SIPS not found"
	@command -v magick >/dev/null 2>&1 && echo "✓ ImageMagick v7 (magick)" || echo "✗ ImageMagick v7 not found"
	@command -v convert >/dev/null 2>&1 && echo "✓ ImageMagick v6 (convert)" || echo "✗ ImageMagick v6 not found"
	@echo "  Install ImageMagick: brew install imagemagick"
	@command -v ffmpeg >/dev/null 2>&1 && echo "✓ FFmpeg" || echo "✗ FFmpeg not found (install with: brew install ffmpeg)"
	@command -v heif-convert >/dev/null 2>&1 && echo "✓ libheif" || echo "✗ libheif not found (install with: brew install libheif)"
	@command -v libreoffice >/dev/null 2>&1 && echo "✓ LibreOffice" || echo "✗ LibreOffice not found (install with: brew install --cask libreoffice)"
	@command -v 7z >/dev/null 2>&1 && echo "✓ p7zip" || echo "✗ p7zip not found (install with: brew install p7zip)"
	@command -v unar >/dev/null 2>&1 && echo "✓ unar (RAR support)" || echo "✗ unar not found (install with: brew install unar)"

# Install all dependencies on macOS
install-deps:
	@echo "Installing dependencies with Homebrew..."
	brew install imagemagick ffmpeg libheif p7zip unar pandoc webp
	brew install --cask libreoffice
	@echo "Dependencies installed!"
	@echo ""
	@echo "Verifying WebP support in ImageMagick..."
	@magick -list format | grep -i webp && echo "✓ WebP support confirmed" || echo "⚠️  WebP support not found - you may need to reinstall ImageMagick"

# Format code (requires clang-format)
format:
	@command -v clang-format >/dev/null 2>&1 && clang-format -i $(SOURCES) $(HEADERS) || echo "clang-format not found"

# Run static analysis (requires cppcheck)
analyze:
	@command -v cppcheck >/dev/null 2>&1 && cppcheck --enable=all --std=c99 $(SOURCES) || echo "cppcheck not found"

# Create a release package
package: clean $(TARGET)
	@mkdir -p release
	@cp $(TARGET) $(HEADERS) Makefile README.md release/ 2>/dev/null || true
	@tar -czf convert-$(shell date +%Y%m%d).tar.gz release/
	@echo "Release package created: convert-$(shell date +%Y%m%d).tar.gz"
	@rm -rf release

# Help target
help:
	@echo "Available targets:"
	@echo "  all          - Build the convert program (default)"
	@echo "  debug        - Build with debug symbols"
	@echo "  clean        - Remove build artifacts"
	@echo "  install      - Install to /usr/local/bin (requires sudo)"
	@echo "  uninstall    - Remove from /usr/local/bin"
	@echo "  test         - Run basic functionality tests"
	@echo "  test-heic    - Test HEIC conversion specifically"
	@echo "  debug-heic   - Debug HEIC conversion tools and process"
	@echo "  check-deps   - Check for required dependencies"
	@echo "  install-deps - Install all dependencies on macOS"
	@echo "  format       - Format source code (requires clang-format)"
	@echo "  analyze      - Run static analysis (requires cppcheck)"
	@echo "  package      - Create release package"
	@echo "  help         - Show this help message"

# Phony targets
.PHONY: all debug clean install uninstall test test-heic debug-heic check-deps install-deps format analyze package help
