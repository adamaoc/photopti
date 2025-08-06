# PhotOpti

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

```bash
npm install -g photopti
```

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
