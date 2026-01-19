export interface WASMExports {
  memory: WebAssembly.Memory;
  
  // Canvas lifecycle
  createCanvas(width: number, height: number, gridSize: number): void;
  clearCanvas(): void;
  
  // Object management
  addObject(x: number, y: number, width: number, height: number, assetId: number, objectType: number): number;
  moveObject(objectId: number, x: number, y: number): void;
  resizeObject(objectId: number, x: number, y: number, width: number, height: number): void;
  deleteObject(objectId: number): void;
  deleteObjects(objectIds: Uint32Array): void;
  
  // Batch operations (for group move/resize as single history entry)
  beginBatchMove(): void;
  addToBatchMove(objectId: number, newX: number, newY: number): void;
  endBatchMove(): void;
  beginBatchResize(): void;
  addToBatchResize(objectId: number, newX: number, newY: number, newWidth: number, newHeight: number): void;
  endBatchResize(): void;
  
  // Object queries
  getObjectCount(): number;
  getObjectIdAtIndex(index: number): number;
  getObjectX(objectId: number): number;
  getObjectY(objectId: number): number;
  getObjectWidth(objectId: number): number;
  getObjectHeight(objectId: number): number;
  getObjectAssetId(objectId: number): number;
  getObjectType(objectId: number): number;
  objectExists(objectId: number): boolean;
  
  // Camera & viewport
  pan(dx: number, dy: number): void;
  zoom(centerX: number, centerY: number, delta: number): void;
  updateViewport(): number;
  getVisibleCount(): number;
  getVisibleObjectId(index: number): number;
  getVisibleObjectAssetId(index: number): number;
  getVisibleObjectType(index: number): number;
  getTransformX(index: number): number;
  getTransformY(index: number): number;
  getTransformWidth(index: number): number;
  getTransformHeight(index: number): number;
  getTransformRotation(index: number): number;
  
  // History
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  
  // Grid
  setGridSnap(enabled: boolean): void;
  setGridSize(size: number): void;
  getGridSize(): number;
  
  // State
  getStateVersion(): number;
  getCameraX(): number;
  getCameraY(): number;
  getCameraZoom(): number;
  getCanvasWidth(): number;
  getCanvasHeight(): number;
  updateCanvasSize(width: number, height: number): void;
}
