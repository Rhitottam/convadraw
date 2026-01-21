/**
 * Create workers using modern ES module URL resolution
 * 
 * Uses the standard `new URL(path, import.meta.url)` pattern.
 * Bundlers recognize this and handle worker bundling automatically.
 * 
 * Note: We reference .js files even though source is .ts because:
 * 1. After build, the workers are compiled to .js
 * 2. TypeScript with proper config allows .js imports for .ts files
 * 3. This ensures the built library references the correct files
 */


/**
 * Create the grid rendering worker
 */
export function createGridWorker(): Worker {
  return new Worker(
    new URL('./grid.worker', import.meta.url),
    { type: 'module' }
  )
  // return new GridWorker();
}

/**
 * Create the image loading worker
 */
export function createImageLoaderWorker(): Worker {
  return new Worker(
    new URL('./image-loader.worker', import.meta.url),
    { type: 'module' }
  )
  
}
