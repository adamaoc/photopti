# PhotOpti - Development Plan

## 1. Project Goal

To create a Node.js-based CLI tool that batch-processes images in a directory. The tool will resize images (by width or percentage), convert them to JPEG, and save them in a designated output folder.

## 2. Proposed Technology Stack

-   **Language:** **TypeScript** (on Node.js). This provides type safety, which helps in creating a more robust and maintainable CLI tool.
-   **Image Processing:** **`sharp`**. This is a high-performance Node.js image library. It's extremely fast and has a simple, chainable API for resizing, format conversion, and optimization. It's the industry standard for this kind of task.
-   **CLI Argument Parsing:** **`yargs`**. This library is excellent for building command-line tools. It makes it easy to parse arguments (like `--width` and `--percentage`), set default values, demand specific options, and automatically generate help text.
-   **File System Interaction:** The built-in Node.js **`fs`** module will be used for reading directories and creating the `Opti` folder. We can use a library like **`glob`** to easily find all image files while ignoring other file types.
-   **User Feedback:** **`chalk`**. To provide a better user experience, `chalk` can be used to add color to the terminal output (e.g., for success messages, errors, and progress updates).

## 3. Step-by-Step Build Plan

1.  **Project Initialization:**
    -   Set up a new Node.js project (`npm init`).
    -   Install TypeScript and necessary type definitions.
    -   Install dependencies: `sharp`, `yargs`, `glob`, and `chalk`.
    -   Configure `tsconfig.json` for compilation.
    -   Add a `bin` field to `package.json` to make the tool executable.

2.  **CLI Entry Point:**
    -   Create the main executable file (e.g., `src/index.ts`).
    -   Use `yargs` to define the CLI interface:
        -   Define the `--width` (`-w`) option (type: number).
        -   Define the `--percentage` (`-p`) option (type: number).
        -   Ensure `width` and `percentage` are mutually exclusive.
        -   Set the default resizing behavior (800px width) if no options are provided.

3.  **Core Image Processing Logic:**
    -   Create a separate module for the image processing logic.
    -   Use `glob` to scan the current directory for common image file types (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.tiff`).
    -   Check if the `Opti/` directory exists. If not, create it using `fs.mkdirSync`.
    -   Loop through each found image file.
    -   For each image:
        -   Use `sharp` to read the image file.
        -   Apply the resize operation based on the parsed `yargs` arguments. If it's a percentage, get the image metadata first to calculate the target width.
        -   Convert the output to JPEG format (`.toFormat('jpeg')`).
        -   Apply JPEG optimization options (`.jpeg({ quality: 80 })`).
        -   Construct the new filename and save it to the `Opti/` directory.
        -   Log a success message to the console using `chalk`.

4.  **Error Handling:**
    -   Implement `try...catch` blocks for file system operations and `sharp` processing to gracefully handle corrupted images or permission issues.
    -   Provide clear, user-friendly error messages.

5.  **Testing & Polish:**
    -   Test with various image formats and sizes.
    -   Add progress indicators for batch processing.
    -   Implement verbose/quiet modes.
    -   Add dry-run option to preview what would be processed.

## 4. File Structure

```
photopti/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── processor.ts       # Core image processing logic
│   └── types.ts          # TypeScript type definitions
├── dist/                 # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── README.md
└── PLAN.md
```

## 5. CLI Interface Design

```bash
photopti [options]

Options:
  -w, --width <pixels>      Resize to specific width in pixels [default: 800]
  -p, --percentage <num>    Resize by percentage of original size
  -q, --quality <num>       JPEG quality (1-100) [default: 80]
  -o, --output <dir>        Output directory name [default: "Opti"]
  -v, --verbose            Show detailed processing information
  --dry-run               Preview files that would be processed
  -h, --help              Show help
```
