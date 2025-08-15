#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { ImageProcessor } from './processor';
import { ProcessingOptions } from './types';

const argv = yargs(hideBin(process.argv))
  .usage('$0 [options]')
  .scriptName('photopti')
  .option('width', {
    alias: 'w',
    type: 'number',
    description: 'Resize to specific width in pixels',
    default: 800
  })
  .option('percentage', {
    alias: 'p',
    type: 'number',
    description: 'Resize by percentage of original size'
  })
  .option('quality', {
    alias: 'q',
    type: 'number',
    description: 'JPEG quality (1-100)',
    default: 80
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output directory name',
    default: 'Opti'
  })
  .option('file', {
    alias: 'f',
    type: 'string',
    description: 'Process a single image file (duplicate and reformat)'
  })
  .option('name', {
    type: 'string',
    description: 'Output base name for single-file mode (no extension)'
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Show detailed processing information',
    default: false
  })
  .option('dry-run', {
    type: 'boolean',
    description: 'Preview files that would be processed',
    default: false
  })
  .option('rename', {
    alias: 'r',
    type: 'string',
    description: 'Rename files with sequential numbering (e.g., "photo" creates photo-001.jpg, photo-002.jpg, etc.)'
  })
  .conflicts('width', 'percentage')
  .check((argv: any) => {
    if (argv.quality < 1 || argv.quality > 100) {
      throw new Error('Quality must be between 1 and 100');
    }
    if (argv.percentage && (argv.percentage <= 0 || argv.percentage > 1000)) {
      throw new Error('Percentage must be between 1 and 1000');
    }
    if (argv.width && argv.width <= 0) {
      throw new Error('Width must be greater than 0');
    }
    if (argv.file && typeof argv.file !== 'string') {
      throw new Error('Invalid --file value');
    }
    return true;
  })
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .parseSync();

async function main() {
  try {
    console.log(chalk.cyan.bold('🖼️  PhotOpti - Image Optimizer'));
    console.log(chalk.gray('Resize and optimize images for the web\n'));

    const options: ProcessingOptions = {
      width: argv.file ? (argv.percentage ? undefined : (argv.width ?? 1600)) : (argv.percentage ? undefined : argv.width),
      percentage: argv.percentage,
      quality: argv.quality,
      output: argv.output,
      verbose: argv.verbose,
      dryRun: argv['dry-run'],
      rename: argv.rename,
      singleFile: argv.file,
      singleName: argv.name,
      outputExplicit: typeof argv.o !== 'undefined' || typeof argv.output !== 'undefined'
    };

    if (options.verbose) {
      console.log(chalk.gray('Configuration:'));
      if (options.percentage) {
        console.log(chalk.gray(`  Resize: ${options.percentage}% of original`));
      } else {
        console.log(chalk.gray(`  Resize: ${options.width}px width`));
      }
      console.log(chalk.gray(`  Quality: ${options.quality}%`));
      console.log(chalk.gray(`  Output: ${options.output}/`));
      if (options.rename) {
        console.log(chalk.gray(`  Rename: ${options.rename}-001.jpg, ${options.rename}-002.jpg, etc.`));
      }
      console.log(chalk.gray(`  Dry run: ${options.dryRun ? 'Yes' : 'No'}`));
      console.log('');
    }

    const processor = new ImageProcessor(options);
    const result = await processor.processImages();

    if (result.errors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`));
  process.exit(1);
});
