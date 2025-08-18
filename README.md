# <img width="30" height="30" alt="logo-lg-200" src="https://github.com/user-attachments/assets/66941ea5-415f-4182-915c-c6967e7ef9fc" /> PhotOpti

![Logo-Work-2](https://github.com/user-attachments/assets/5184517a-572f-4580-905b-01f9b751f529)

A fast and simple command-line tool to resize and optimize images for the web.

## Overview

`PhotOpti` is designed to be run from a directory containing images. It processes all image files it finds, resizes them according to your specifications, converts them to the web-friendly JPEG format, and saves the optimized versions in a new folder named `Opti`.

## Features

-   Resize images by a specific pixel width or percentage of original size
-   Defaults to a width of 800px if no size is specified
-   Converts all processed images to `.jpg` format for maximum compatibility
-   Automatically creates an output directory
-   Customizable JPEG quality settings
-   Progress indicators for batch processing
-   Verbose mode with detailed processing information
-   Dry-run mode to preview operations without making changes
-   Comprehensive error handling and validation

## Installation

This project is not yet published on npm. You can install and run it directly from GitHub.

### Option A: Run via `npx` from GitHub
Requires Node.js >= 16.
```bash
npx github:adamaoc/photopti --help
```

### Option B: Global install from GitHub
This will clone, build (via prepare), and link the CLI.
```bash
npm install -g github:adamaoc/photopti
```

After install, ensure your npm global bin is on PATH (see Using with Zsh below) so you can run `photopti`.

## Using with Zsh

If `photopti` is not found after a global install, make sure your npm global bin directory is on your `PATH` in Zsh.

1) Verify it's available:
```bash
command -v photopti
```

2) If not found, add npm's global bin to your PATH in `~/.zshrc`:
```bash
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

3) Optional: create a short alias:
```bash
echo 'alias po="photopti"' >> ~/.zshrc && source ~/.zshrc
```

Note: Shell completions for Zsh are not provided yet.

## Usage

Navigate to your folder of images in the terminal and run the tool.

### Basic Usage

**Default (Resize to 800px width, 80% quality):**
```bash
photopti
```

### All Available Options

```bash
photopti [options]

Options:
  -w, --width <pixels>      Resize to specific width in pixels [default: 800]
  -p, --percentage <num>    Resize by percentage of original size
  -q, --quality <num>       JPEG quality (1-100) [default: 80]
  -o, --output <dir>        Output directory name [default: "Opti"]
  -r, --rename <name>       Rename files with sequential numbering
  -f, --file <path>         Process a single image file (duplicate and reformat)
      --name <string>       Output base name for single-file mode (no extension)
  -v, --verbose            Show detailed processing information
      --dry-run            Preview files that would be processed
  -h, --help               Show help
      --version            Show version number
```

### Examples

**Resize to specific width:**
```bash
photopti --width 1200
photopti -w 1920
```

**Resize by percentage:**
```bash
photopti --percentage 50    # Reduce to 50% of original size
photopti -p 75              # Reduce to 75% of original size
```

**Custom quality settings:**
```bash
photopti --quality 95       # High quality (larger files)
photopti -q 60              # Lower quality (smaller files)
```

**Custom output directory:**
```bash
photopti --output "resized"
photopti -o "web-images"
```

**Verbose mode (detailed information):**
```bash
photopti --verbose
photopti -v
```

**Rename files with sequential numbering:**
```bash
photopti --rename "vacation"     # Creates vacation-001.jpg, vacation-002.jpg, etc.
photopti -r "photo"              # Creates photo-001.jpg, photo-002.jpg, etc.
```

**Dry run (preview without processing):**
```bash
photopti --dry-run
photopti --dry-run --verbose    # Preview with detailed info
```

**Combine options:**
```bash
photopti --width 1200 --quality 90 --output "optimized" --verbose
photopti --rename "summer" --percentage 75 --quality 85 --verbose
```

### Single-file mode (duplicate and reformat)

Use `--file` to process just one image. Defaults:
- **Width**: 1600px (keeps aspect ratio)
- **Rename**: original name with `--copy` suffix
- **Destination**: if an `Opti/` folder exists in the current directory, the new image goes there; otherwise, it is saved in the current directory

Examples:
```bash
# Basic: duplicate one file to 1600px wide, same folder or Opti if it exists
photopti --file ./IMG_1234.JPG

# Specify a different output directory (created if missing)
photopti --file ./IMG_1234.JPG --output ./resized

# Specify a custom name (without extension)
photopti --file ./IMG_1234.JPG --name hero-banner

# Use percentage instead of width
photopti --file ./IMG_1234.JPG --percentage 50
```

## Supported Image Formats

**Input formats:** PNG, JPG, JPEG, WebP, GIF, TIFF, BMP, AVIF  
**Output format:** JPG (optimized for web)

## Output

All processed images will be saved in the specified output directory (default: `Opti/`) within your current folder. 

- **Without rename**: Maintains original filenames with `.jpg` extensions
- **With rename**: Creates sequentially numbered files (e.g., `photo-001.jpg`, `photo-002.jpg`, etc.)

## Requirements

- Node.js >= 16.0.0

## Notes

- Width and percentage options are mutually exclusive
- Quality must be between 1-100
- Percentage must be between 1-1000
- The tool will automatically create the output directory if it doesn't exist
- Original files are never modified - only new optimized versions are created
