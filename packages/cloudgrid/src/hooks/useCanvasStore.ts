import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { CanvasImage } from '../types/canvas';
import type { WASMExports } from '../utils/wasmLoader';

// Asset ID to source URL mapping (kept in JS for efficient string handling)
const assetRegistry = new Map<number, string>(); // numericId -> src
const numericToStringIdRegistry = new Map<number, string>(); // numericId -> assetStringId
let nextAssetId = 1;

// Asset metadata registry - stores intrinsic asset data like color, dimensions, etc.
interface AssetMetadata {
  originalWidth?: number;
  originalHeight?: number;
  originalAspectRatio?: number;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
  // Color data for sorting
  color?: {
    r: number;
    g: number;
    b: number;
  };
  colorScore?: number; // Computed: (r - g) / (r + g + b + 1)
  [key: string]: any; // Allow custom metadata
}

const assetMetadataRegistry = new Map<string, AssetMetadata>(); // assetId -> metadata
const srcToAssetIdsRegistry = new Map<string, Set<string>>(); // src -> Set<assetId> (reverse lookup)

export function registerAsset(src: string, assetStringId?: string): number {
  const id = nextAssetId++;
  assetRegistry.set(id, src);
  if (assetStringId) {
    numericToStringIdRegistry.set(id, assetStringId);
  }
  return id;
}

export function getAssetSrc(assetId: number): string {
  return assetRegistry.get(assetId) || '';
}

export function clearAssetRegistry(): void {
  assetRegistry.clear();
  numericToStringIdRegistry.clear();
  nextAssetId = 1;
  assetMetadataRegistry.clear();
  srcToAssetIdsRegistry.clear();
}

export function getAssetStringId(numericId: number): string | undefined {
  return numericToStringIdRegistry.get(numericId);
}

// Asset metadata management
export function setAssetMetadata(assetId: string, metadata: Partial<AssetMetadata>, src?: string): void {
  const existing = assetMetadataRegistry.get(assetId) || {};
  assetMetadataRegistry.set(assetId, { ...existing, ...metadata });
  
  // Update reverse lookup if src is provided
  if (src) {
    if (!srcToAssetIdsRegistry.has(src)) {
      srcToAssetIdsRegistry.set(src, new Set());
    }
    srcToAssetIdsRegistry.get(src)!.add(assetId);
  }
}

export function getAssetMetadata(assetId: string): AssetMetadata | undefined {
  return assetMetadataRegistry.get(assetId);
}

export function updateAssetColor(src: string, color: { r: number; g: number; b: number }): void {
  const colorScore = (color.r - color.g) / (color.r + color.g + color.b + 1);
  
  // Update all assets that use this src
  const assetIds = srcToAssetIdsRegistry.get(src);
  if (assetIds) {
    assetIds.forEach(assetId => {
      setAssetMetadata(assetId, { color, colorScore });
    });
  }
}

export function getAssetIdsBySrc(src: string): Set<string> {
  return srcToAssetIdsRegistry.get(src) || new Set();
}

// Store for external subscription pattern
interface CanvasState {
  images: CanvasImage[];
  stateVersion: number;
}

let currentState: CanvasState = { images: [], stateVersion: 0 };
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CanvasState {
  return currentState;
}

// Sync WASM state to React state
export function syncFromWasm(wasm: WASMExports): void {
  const wasmVersion = wasm.getStateVersion();
  
  // Only sync if version changed
  if (wasmVersion === currentState.stateVersion) return;
  
  const count = wasm.getObjectCount();
  const images: CanvasImage[] = [];
  
  for (let i = 0; i < count; i++) {
    const objectId = wasm.getObjectIdAtIndex(i);
    if (objectId === 0) continue;
    
    const assetId = wasm.getObjectAssetId(objectId);
    const src = getAssetSrc(assetId);
    
    if (src) {
      images.push({
        id: `img-${objectId}`,
        x: wasm.getObjectX(objectId),
        y: wasm.getObjectY(objectId),
        width: wasm.getObjectWidth(objectId),
        height: wasm.getObjectHeight(objectId),
        src,
      });
    }
  }
  
  currentState = { images, stateVersion: wasmVersion };
  emitChange();
}

// Hook for components to use canvas state
export function useCanvasStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Hook for canvas actions
export function useCanvasActions(wasm: WASMExports | null) {
  const moveObject = useCallback(
    (objectId: number, x: number, y: number) => {
      if (!wasm) return;
      wasm.moveObject(objectId, x, y);
      syncFromWasm(wasm);
    },
    [wasm]
  );

  const resizeObject = useCallback(
    (objectId: number, x: number, y: number, width: number, height: number) => {
      if (!wasm) return;
      wasm.resizeObject(objectId, x, y, width, height);
      syncFromWasm(wasm);
    },
    [wasm]
  );

  // Batch move: moves multiple objects as a single history entry
  const batchMoveObjects = useCallback(
    (moves: Array<{ objectId: number; x: number; y: number }>) => {
      if (!wasm || moves.length === 0) return;
      
      wasm.beginBatchMove();
      moves.forEach(({ objectId, x, y }) => {
        // Get old position from WASM
        const oldX = wasm.getObjectX(objectId);
        const oldY = wasm.getObjectY(objectId);
        wasm.addToBatchMove(objectId, oldX, oldY, x, y);
      });
      wasm.endBatchMove();
      syncFromWasm(wasm);
    },
    [wasm]
  );

  // Batch resize: resizes multiple objects as a single history entry
  const batchResizeObjects = useCallback(
    (resizes: Array<{ objectId: number; x: number; y: number; width: number; height: number }>) => {
      if (!wasm || resizes.length === 0) return;
      
      wasm.beginBatchResize();
      resizes.forEach(({ objectId, x, y, width, height }) => {
        // Get old position and dimensions from WASM
        const oldX = wasm.getObjectX(objectId);
        const oldY = wasm.getObjectY(objectId);
        const oldWidth = wasm.getObjectWidth(objectId);
        const oldHeight = wasm.getObjectHeight(objectId);
        wasm.addToBatchResize(objectId, oldX, oldY, oldWidth, oldHeight, x, y, width, height);
      });
      wasm.endBatchResize();
      syncFromWasm(wasm);
    },
    [wasm]
  );

  const deleteObject = useCallback(
    (objectId: number) => {
      if (!wasm) return;
      wasm.deleteObject(objectId);
      syncFromWasm(wasm);
    },
    [wasm]
  );

  const deleteObjects = useCallback(
    (objectIds: number[]) => {
      if (!wasm || objectIds.length === 0) return;
      
      // For batch operations, we need to pass data to WASM via memory
      // For simplicity, we'll do individual deletes but skip syncing until the end
      objectIds.forEach((id) => wasm.deleteObject(id));
      syncFromWasm(wasm);
    },
    [wasm]
  );

  const undo = useCallback(() => {
    if (!wasm) return false;
    if (!wasm.canUndo()) return false;
    wasm.undo();
    syncFromWasm(wasm);
    return true;
  }, [wasm]);

  const redo = useCallback(() => {
    if (!wasm) return false;
    if (!wasm.canRedo()) return false;
    wasm.redo();
    syncFromWasm(wasm);
    return true;
  }, [wasm]);

  const canUndo = useCallback(() => {
    if (!wasm) return false;
    return wasm.canUndo();
  }, [wasm]);

  const canRedo = useCallback(() => {
    if (!wasm) return false;
    return wasm.canRedo();
  }, [wasm]);

  return {
    moveObject,
    resizeObject,
    batchMoveObjects,
    batchResizeObjects,
    deleteObject,
    deleteObjects,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

// Keyboard shortcuts hook
export function useUndoRedoShortcuts(
  wasm: WASMExports | null,
  onUndoRedo?: () => void
) {
  useEffect(() => {
    if (!wasm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (wasm.canUndo()) {
          wasm.undo();
          syncFromWasm(wasm);
          onUndoRedo?.();
        }
      } else if (
        (isMod && e.key === 'z' && e.shiftKey) ||
        (isMod && e.key === 'y')
      ) {
        e.preventDefault();
        if (wasm.canRedo()) {
          wasm.redo();
          syncFromWasm(wasm);
          onUndoRedo?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wasm, onUndoRedo]);
}

// Initialize canvas with images
export function initializeCanvasWithImages(
  wasm: WASMExports,
  images: Array<{ src: string; x: number; y: number; width: number; height: number }>
): void {
  images.forEach((img) => {
    const assetId = registerAsset(img.src);
    wasm.addObject(img.x, img.y, img.width, img.height, assetId, 1);
  });
  
  syncFromWasm(wasm);
}

// Get numeric object ID from string ID
export function getNumericId(id: string): number {
  const match = id.match(/img-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
