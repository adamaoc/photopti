export interface ProcessingOptions {
  width?: number;
  percentage?: number;
  quality: number;
  output: string;
  verbose: boolean;
  dryRun: boolean;
  rename?: string;
  /** Path to a single image file to process (enables single-file mode) */
  singleFile?: string;
  /** Output base name for single-file mode (without extension) */
  singleName?: string;
  /** Whether user explicitly provided an output directory flag */
  outputExplicit?: boolean;
}

export interface ProcessingResult {
  processed: number;
  errors: number;
  skipped: number;
}

export interface ImageFile {
  path: string;
  name: string;
  extension: string;
}

export const SUPPORTED_FORMATS = [
  '.png',
  '.jpg', 
  '.jpeg',
  '.webp',
  '.gif',
  '.tiff',
  '.bmp',
  '.avif'
] as const;

export type SupportedFormat = typeof SUPPORTED_FORMATS[number];
