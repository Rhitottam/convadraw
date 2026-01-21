/**
 * Image Loading and LOD (Level of Detail) Management
 * 
 * Memory-Efficient Image Loading:
 * - Worker caches compressed blobs (~100-200KB each)
 * - Main thread only holds decoded bitmaps for VISIBLE images
 * - Bitmaps are re-decoded at appropriate resolution when zoom/size changes
 * - Bitmaps are closed when images leave viewport
 */

import { useEffect, useState } from 'react';
import { createImageLoaderWorker } from '../workers/createWorker';

// Resolution levels - same URL decoded at different sizes
export const LOD_LEVELS = {
  small: 150,   // For thumbnails / zoomed out
  medium: 400,  // For normal view
  full: 0,      // 0 = original resolution
} as const;

export type LODLevel = keyof typeof LOD_LEVELS;

// Track which blobs are cached in the worker
const cachedBlobs = new Set<string>();
const loadingBlobs = new Set<string>();

// Track decoded bitmaps with their current LOD level
interface DecodedEntry {
  bitmap: ImageBitmap;
  level: LODLevel;
}
const decodedBitmaps = new Map<string, DecodedEntry>();
const decodingImages = new Map<string, LODLevel>(); // Track what level is being decoded

// Color data for sorting
export interface ImageColor {
  r: number;
  g: number;
  b: number;
}
export const imageColors = new Map<string, ImageColor>();

let imageWorker: Worker | null = null;

// Determine which LOD level to use based on display size
export function getLODLevel(displayWidth: number, displayHeight: number): LODLevel {
  const maxDim = Math.max(displayWidth, displayHeight);
  if (maxDim <= 150) return 'small';
  if (maxDim <= 400) return 'medium';
  return 'full';
}

export function getImageWorker(): Worker {
  if (!imageWorker) {
    imageWorker = createImageLoaderWorker()
    imageWorker.onmessage = (e) => {
      const { type, id, bitmap, requestedMaxDim, color } = e.data;
      
      if (type === 'cached') {
        // Blob is now cached in worker, ready for decode
        cachedBlobs.add(id);
        loadingBlobs.delete(id);
        
        // Store color data for sorting
        if (color) {
          imageColors.set(id, color);
          window.dispatchEvent(new CustomEvent('image-color-ready', { detail: { id, color } }));
        }
        
        window.dispatchEvent(new CustomEvent('blob-cached', { detail: { id } }));
      } else if (type === 'decoded' && bitmap) {
        // Determine which level this decode was for
        const level = decodingImages.get(id) || 
          (requestedMaxDim === 150 ? 'small' : requestedMaxDim === 400 ? 'medium' : 'full');
        decodingImages.delete(id);
        
        // Close any existing bitmap for this id
        const existing = decodedBitmaps.get(id);
        if (existing) {
          try { existing.bitmap.close(); } catch { /* ignore */ }
        }
        
        decodedBitmaps.set(id, { bitmap, level });
        window.dispatchEvent(new CustomEvent('image-decoded', { detail: { id, level } }));
      } else if (type === 'error') {
        loadingBlobs.delete(id);
        decodingImages.delete(id);
      }
    };
  }
  return imageWorker;
}

// Request blob to be cached (fast, no limit on concurrent requests)
export function requestBlobCache(src: string): void {
  if (cachedBlobs.has(src) || loadingBlobs.has(src)) return;
  loadingBlobs.add(src);
  const worker = getImageWorker();
  worker.postMessage({ type: 'load', id: src, src });
}

// Request decode of a cached blob at specific LOD level
function requestDecode(src: string, level: LODLevel): void {
  if (!cachedBlobs.has(src)) return;
  
  // Skip if already decoding at this or higher level
  const currentlyDecoding = decodingImages.get(src);
  if (currentlyDecoding) {
    // If we're already decoding at a higher quality level, don't downgrade
    const levels: LODLevel[] = ['small', 'medium', 'full'];
    if (levels.indexOf(currentlyDecoding) >= levels.indexOf(level)) return;
  }
  
  decodingImages.set(src, level);
  const worker = getImageWorker();
  const maxDim = LOD_LEVELS[level];
  worker.postMessage({ type: 'decode', id: src, maxDim });
}

// Release a bitmap when image is no longer visible
function releaseBitmap(src: string): void {
  const entry = decodedBitmaps.get(src);
  if (entry) {
    try { entry.bitmap.close(); } catch { /* ignore */ }
    decodedBitmaps.delete(src);
  }
  decodingImages.delete(src);
}

/**
 * Hook for on-demand image loading with LOD support
 * 
 * @param src - Image source URL
 * @param displayWidth - Width of image in viewport
 * @param displayHeight - Height of image in viewport
 * @param isVisible - Whether the image is currently visible
 * @returns ImageBitmap or undefined if not loaded yet
 */
export function useImageOnDemand(
  src: string,
  displayWidth: number,
  displayHeight: number,
  isVisible: boolean
): ImageBitmap | undefined {
  const [, forceUpdate] = useState(0);
  const neededLevel = getLODLevel(displayWidth, displayHeight);

  // Start loading blob and decode when visible
  useEffect(() => {
    if (!isVisible) return;
    
    // Request blob cache
    requestBlobCache(src);
    
    const handleCached = (e: CustomEvent) => {
      if (e.detail.id === src) {
        // Blob cached, now request decode at needed level
        requestDecode(src, neededLevel);
      }
    };
    
    const handleDecoded = (e: CustomEvent) => {
      if (e.detail.id === src) {
        forceUpdate((n) => n + 1);
      }
    };
    
    window.addEventListener('blob-cached', handleCached as EventListener);
    window.addEventListener('image-decoded', handleDecoded as EventListener);
    
    // If blob already cached, check if we need to decode/upgrade
    if (cachedBlobs.has(src)) {
      const existing = decodedBitmaps.get(src);
      if (!existing) {
        // No bitmap yet, request decode
        requestDecode(src, neededLevel);
      } else {
        // Check if we need a higher resolution
        const levels: LODLevel[] = ['small', 'medium', 'full'];
        const currentIdx = levels.indexOf(existing.level);
        const neededIdx = levels.indexOf(neededLevel);
        if (neededIdx > currentIdx && !decodingImages.has(src)) {
          // Need higher resolution, request upgrade
          requestDecode(src, neededLevel);
        }
      }
    }
    
    return () => {
      window.removeEventListener('blob-cached', handleCached as EventListener);
      window.removeEventListener('image-decoded', handleDecoded as EventListener);
    };
  }, [src, isVisible, neededLevel]);

  // Release bitmap when no longer visible
  useEffect(() => {
    if (!isVisible) {
      releaseBitmap(src);
    }
  }, [src, isVisible]);

  const entry = decodedBitmaps.get(src);
  return isVisible ? entry?.bitmap : undefined;
}
