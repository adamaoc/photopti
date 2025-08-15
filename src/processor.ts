import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import sharp from 'sharp';
import chalk from 'chalk';
import { ProcessingOptions, ProcessingResult, ImageFile, SUPPORTED_FORMATS } from './types';

export class ImageProcessor {
  private options: ProcessingOptions;
  private fileCounter: number = 1;

  constructor(options: ProcessingOptions) {
    this.options = options;
  }

  async findImageFiles(): Promise<ImageFile[]> {
    const patterns = SUPPORTED_FORMATS.flatMap(ext => [
      `*${ext}`,           // lowercase
      `*${ext.toUpperCase()}`  // uppercase
    ]);
    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: process.cwd() });
      files.push(...matches);
    }

    // Remove duplicates and filter for supported extensions
    const uniqueFiles = [...new Set(files)];
    
    return uniqueFiles
      .filter(file => {
        const ext = path.parse(file).ext.toLowerCase();
        return SUPPORTED_FORMATS.includes(ext as any);
      })
      .map(file => ({
        path: file,
        name: path.parse(file).name,
        extension: path.parse(file).ext.toLowerCase()
      }));
  }

  async processImages(): Promise<ProcessingResult> {
    const result: ProcessingResult = { processed: 0, errors: 0, skipped: 0 };
    
    try {
      if (this.options.singleFile) {
        await this.processSingleFile(result);
      } else {
        // Find all image files
        const imageFiles = await this.findImageFiles();
        
        if (imageFiles.length === 0) {
          console.log(chalk.yellow('No supported image files found in the current directory.'));
          return result;
        }

        console.log(chalk.cyan(`Found ${imageFiles.length} image file(s) to process...`));

        // Create output directory if it doesn't exist
        if (!this.options.dryRun && !fs.existsSync(this.options.output)) {
          fs.mkdirSync(this.options.output, { recursive: true });
          if (this.options.verbose) {
            console.log(chalk.green(`Created output directory: ${this.options.output}`));
          }
        }

        // Process each image
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          try {
            if (!this.options.verbose && !this.options.dryRun) {
              process.stdout.write(`\rProcessing: ${i + 1}/${imageFiles.length} (${imageFile.name})`);
            }
            await this.processImage(imageFile);
            result.processed++;
          } catch (error) {
            result.errors++;
            console.error(chalk.red(`\nError processing ${imageFile.path}: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        }
        
        // Clear progress line if we were showing it
        if (!this.options.verbose && !this.options.dryRun && imageFiles.length > 0) {
          process.stdout.write('\r');
          process.stdout.clearLine(0);
        }
      }

      // Summary
      console.log(chalk.green(`\n✓ Processing complete!`));
      console.log(chalk.white(`  Processed: ${result.processed}`));
      if (result.errors > 0) {
        console.log(chalk.red(`  Errors: ${result.errors}`));
      }
      if (result.skipped > 0) {
        console.log(chalk.yellow(`  Skipped: ${result.skipped}`));
      }

    } catch (error) {
      console.error(chalk.red(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      result.errors++;
    }

    return result;
  }

  private resolveSingleFileOutputDir(): string {
    // If user explicitly set an output dir, always use/create it
    const userSpecifiedOutput = (this.options as any).outputExplicit === true;
    if (userSpecifiedOutput) {
      return this.options.output;
    }

    // Default behavior: if existing Opti folder is present, use it; else current directory
    const optiDir = this.options.output; // typically 'Opti'
    if (fs.existsSync(optiDir) && fs.statSync(optiDir).isDirectory()) {
      return optiDir;
    }
    return '.';
  }

  private async processSingleFile(result: ProcessingResult): Promise<void> {
    const inputPath = this.options.singleFile!;

    if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isFile()) {
      console.log(chalk.red(`File not found: ${inputPath}`));
      result.errors++;
      return;
    }

    const parsed = path.parse(inputPath);
    const extLower = parsed.ext.toLowerCase();
    if (!SUPPORTED_FORMATS.includes(extLower as any)) {
      console.log(chalk.yellow(`Skipping unsupported file type: ${inputPath}`));
      result.skipped++;
      return;
    }

    const outputDir = this.resolveSingleFileOutputDir();
    const baseName = this.options.singleName ? this.options.singleName : `${parsed.name}--copy`;
    const outputFileName = `${baseName}.jpg`;
    const outputPath = path.join(outputDir, outputFileName);

    if (this.options.dryRun) {
      console.log(chalk.blue(`[DRY RUN] Would process: ${inputPath} → ${outputPath}`));
      return;
    }

    // Ensure output dir exists if it was explicitly specified
    if ((this.options as any).outputExplicit === true && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      if (this.options.verbose) {
        console.log(chalk.green(`Created output directory: ${outputDir}`));
      }
    }

    if (this.options.verbose) {
      console.log(chalk.gray(`Processing single file: ${inputPath}`));
    }

    let sharpInstance = sharp(inputPath);
    const metadata = await sharpInstance.metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Could not read image dimensions');
    }

    let targetWidth: number;
    if (this.options.percentage) {
      targetWidth = Math.round(metadata.width * (this.options.percentage / 100));
    } else {
      targetWidth = this.options.width ?? 1600;
    }

    if (targetWidth !== metadata.width) {
      sharpInstance = sharpInstance.resize(targetWidth);
    }

    await sharpInstance
      .jpeg({ quality: this.options.quality })
      .toFile(outputPath);

    if (this.options.verbose) {
      const originalSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
      console.log(chalk.green(`  ✓ ${inputPath} → ${outputPath}`));
      console.log(chalk.gray(`    ${metadata.width}x${metadata.height} → ${targetWidth}px wide, ${savings}% smaller`));
    }

    result.processed++;
  }

  private async processImage(imageFile: ImageFile): Promise<void> {
    let outputFileName: string;
    
    if (this.options.rename) {
      // Generate sequential numbered filename
      const paddedNumber = this.fileCounter.toString().padStart(3, '0');
      outputFileName = `${this.options.rename}-${paddedNumber}.jpg`;
      this.fileCounter++;
    } else {
      // Use original filename
      outputFileName = `${imageFile.name}.jpg`;
    }
    
    const outputPath = path.join(this.options.output, outputFileName);
    
    if (this.options.dryRun) {
      console.log(chalk.blue(`[DRY RUN] Would process: ${imageFile.path} → ${outputPath}`));
      return;
    }

    if (this.options.verbose) {
      console.log(chalk.gray(`Processing: ${imageFile.path}`));
    }

    let sharpInstance = sharp(imageFile.path);
    
    // Get image metadata to calculate dimensions
    const metadata = await sharpInstance.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Could not read image dimensions');
    }

    // Calculate target width
    let targetWidth: number;
    
    if (this.options.percentage) {
      targetWidth = Math.round(metadata.width * (this.options.percentage / 100));
    } else {
      targetWidth = this.options.width || 800;
    }

    // Only resize if the target width is different from current width
    if (targetWidth !== metadata.width) {
      sharpInstance = sharpInstance.resize(targetWidth);
    }

    // Convert to JPEG with specified quality
    await sharpInstance
      .jpeg({ quality: this.options.quality })
      .toFile(outputPath);

    if (this.options.verbose) {
      const originalSize = fs.statSync(imageFile.path).size;
      const newSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
      
      console.log(chalk.green(`  ✓ ${imageFile.path} → ${outputPath}`));
      console.log(chalk.gray(`    ${metadata.width}x${metadata.height} → ${targetWidth}px wide, ${savings}% smaller`));
    }
  }
}
