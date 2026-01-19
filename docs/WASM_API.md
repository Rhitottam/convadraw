# WebAssembly (WASM) Module Documentation

CloudGrid uses WebAssembly compiled from AssemblyScript for performance-critical operations like spatial indexing and viewport management.

## Overview

The WASM module provides:

- **Quadtree-based spatial indexing** for efficient viewport culling
- **Camera and viewport management** for pan/zoom operations
- **Grid system** for snap-to-grid functionality
- **Command history** for undo/redo operations

## Building the WASM Module

```bash
cd src/wasm
npm install
npm run asbuild
```

### Build Options

| Script | Output | Use Case |
|--------|--------|----------|
| `asbuild:debug` | `build/debug.wasm` | Development with source maps |
| `asbuild:release` | `build/optimized.wasm` | Production (smaller, faster) |
| `asbuild` | Both | Full build |

## Module Architecture

```
src/wasm/assembly/
├── index.ts          # Exports all public APIs
├── quadtree.ts       # Spatial indexing data structure
├── viewport.ts       # Camera and viewport management
├── canvas-manager.ts # Main canvas state manager
├── grid.ts           # Grid snapping system
└── commands.ts       # Undo/redo command pattern
```

## API Reference

### Canvas Manager

The main entry point for canvas operations.

#### `createCanvas(width: i32, height: i32, gridSize: i32): void`

Initialize the canvas with dimensions and grid size.

```typescript
wasm.createCanvas(1920, 1080, 20);
```

#### `updateCanvasSize(width: i32, height: i32): void`

Update canvas dimensions (e.g., on window resize).

```typescript
wasm.updateCanvasSize(window.innerWidth, window.innerHeight);
```

### Object Management

#### `addObject(x: f32, y: f32, width: f32, height: f32, assetId: u32, objectType: u8): u32`

Add an object to the canvas. Returns the object's unique ID.

```typescript
const objectId = wasm.addObject(100.0, 200.0, 400.0, 300.0, assetId, 1);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | `f32` | X position |
| `y` | `f32` | Y position |
| `width` | `f32` | Object width |
| `height` | `f32` | Object height |
| `assetId` | `u32` | Associated asset ID (for image lookup) |
| `objectType` | `u8` | Object type (1 = image) |

#### `moveObject(objectId: u32, newX: f32, newY: f32): void`

Move an object to a new position (with undo support).

```typescript
wasm.moveObject(1, 150.0, 250.0);
```

#### `resizeObject(objectId: u32, newX: f32, newY: f32, newWidth: f32, newHeight: f32): void`

Resize an object (with undo support). Position may change for corner resizes.

```typescript
wasm.resizeObject(1, 100.0, 100.0, 600.0, 400.0);
```

#### `deleteObject(objectId: u32): void`

Remove an object from the canvas (with undo support).

```typescript
wasm.deleteObject(1);
```

#### Object Queries

```typescript
// Get total object count
const count = wasm.getObjectCount();

// Get object ID by index
const id = wasm.getObjectIdAtIndex(0);

// Get object properties
const x = wasm.getObjectX(id);
const y = wasm.getObjectY(id);
const width = wasm.getObjectWidth(id);
const height = wasm.getObjectHeight(id);
const assetId = wasm.getObjectAssetId(id);

// Check if object exists
const exists = wasm.objectExists(id);
```

### Camera & Viewport

#### `pan(deltaX: f32, deltaY: f32): void`

Pan the camera by the specified delta.

```typescript
wasm.pan(-50.0, -30.0); // Pan left and up
```

#### `zoom(factor: f32, centerX: f32, centerY: f32): void`

Zoom the camera around a center point.

```typescript
wasm.zoom(1.1, 960.0, 540.0); // Zoom in 10% around center
```

#### `getCameraX(): f32`, `getCameraY(): f32`, `getCameraZoom(): f32`

Get current camera state.

```typescript
const x = wasm.getCameraX();
const y = wasm.getCameraY();
const zoom = wasm.getCameraZoom();
```

### Viewport Culling

#### `updateViewport(viewX: f32, viewY: f32, viewWidth: f32, viewHeight: f32): void`

Update the visible viewport area for culling calculations.

```typescript
wasm.updateViewport(cameraX, cameraY, screenWidth / zoom, screenHeight / zoom);
```

#### `getVisibleCount(): i32`

Get the number of objects visible in the current viewport.

```typescript
const count = wasm.getVisibleCount();
```

#### `getVisibleObjectId(index: i32): i32`

Get the ID of a visible object by index.

```typescript
for (let i = 0; i < wasm.getVisibleCount(); i++) {
  const id = wasm.getVisibleObjectId(i);
  // Render object with this ID
}
```

### Grid System

#### `setGridSize(size: i32): void`

Set the grid size for snapping.

```typescript
wasm.setGridSize(25);
```

#### `getGridSize(): i32`

Get the current grid size.

```typescript
const gridSize = wasm.getGridSize();
```

#### `setGridSnap(enabled: bool): void`

Enable or disable grid snapping.

```typescript
wasm.setGridSnap(true);
```

### Undo/Redo

The command history system supports undo/redo for all canvas operations.

#### `undo(): boolean`

Undo the last operation. Returns `true` if successful.

```typescript
if (wasm.undo()) {
  console.log('Undone successfully');
}
```

#### `redo(): boolean`

Redo the previously undone operation. Returns `true` if successful.

```typescript
if (wasm.redo()) {
  console.log('Redone successfully');
}
```

#### `canUndo(): boolean`

Check if undo is available.

```typescript
if (wasm.canUndo()) {
  // Enable undo button
}
```

#### `canRedo(): boolean`

Check if redo is available.

```typescript
if (wasm.canRedo()) {
  // Enable redo button
}
```

#### State Version

The state version increments on every change, useful for React subscriptions:

```typescript
const version = wasm.getStateVersion();
// Use to trigger React re-renders when state changes
```

## Quadtree Implementation

The Quadtree provides O(log n) spatial queries for viewport culling.

### Structure

```typescript
class Quadtree {
  bounds: AABB;           // Axis-aligned bounding box
  objects: CanvasObject[]; // Objects in this node
  children: Quadtree[];    // Four child quadrants (NW, NE, SW, SE)
  
  insert(obj: CanvasObject): boolean;
  queryViewport(viewport: AABB): CanvasObject[];
  remove(id: i32): boolean;
}
```

### AABB (Axis-Aligned Bounding Box)

```typescript
class AABB {
  x: f32;      // Top-left X
  y: f32;      // Top-left Y
  width: f32;  // Width
  height: f32; // Height
  
  contains(point: { x: f32, y: f32 }): boolean;
  intersects(other: AABB): boolean;
}
```

### Performance Characteristics

| Operation | Time Complexity |
|-----------|-----------------|
| Insert | O(log n) |
| Remove | O(log n) |
| Query viewport | O(log n + k) where k = results |
| Update position | O(log n) |

## Memory Management

AssemblyScript uses automatic memory management with a garbage collector. However, for optimal performance:

1. **Reuse objects** where possible instead of creating new ones
2. **Batch operations** to minimize GC pressure
3. **Use typed arrays** for bulk data transfer

### Memory Layout

```
┌─────────────────────────────────────────┐
│ WASM Linear Memory                       │
├─────────────────────────────────────────┤
│ Static Data (strings, constants)         │
├─────────────────────────────────────────┤
│ Stack                                    │
├─────────────────────────────────────────┤
│ Heap (managed by AS runtime)             │
│ - Quadtree nodes                         │
│ - CanvasObject instances                 │
│ - Command history                        │
└─────────────────────────────────────────┘
```

## Integration with JavaScript

### Loading the Module

```typescript
import * as wasm from '@wasm/optimized.js';

// Wait for WASM to initialize
await wasm.default();

// Now use the exports
wasm.createCanvas(1920, 1080, 20);
```

### Type Definitions

Type definitions are in `src/app/types/wasm.d.ts`:

```typescript
export interface WASMExports {
  createCanvas(width: number, height: number, gridSize: number): void;
  addObject(id: number, x: number, y: number, width: number, height: number, assetId: number): void;
  moveObject(id: number, newX: number, newY: number): void;
  deleteObject(id: number): void;
  pan(deltaX: number, deltaY: number): void;
  zoom(factor: number, centerX: number, centerY: number): void;
  // ... more exports
}
```

## Debugging

### Debug Build

Use the debug build for development:

```typescript
import * as wasm from '@wasm/debug.js';
```

The debug build includes:
- Source maps for AssemblyScript
- Runtime assertions
- Detailed error messages

### Performance Profiling

1. Use Chrome DevTools Performance tab
2. Look for WASM functions in the flame chart
3. Check memory usage in the Memory tab

## Best Practices

1. **Initialize early**: Create the canvas during app initialization
2. **Batch updates**: Group multiple object updates together
3. **Use viewport culling**: Only render visible objects
4. **Avoid frequent allocations**: Reuse command objects where possible

## Troubleshooting

### Common Issues

**WASM module not loading**
- Check that the build completed successfully
- Verify the import path is correct

**Objects not appearing**
- Verify viewport is being updated
- Check object coordinates are within viewport

**Poor performance**
- Ensure you're using the optimized build
- Check that viewport culling is working
- Profile to identify bottlenecks

## Future Improvements

- [ ] SIMD optimizations for bulk operations
- [ ] Shared memory with Web Workers
- [ ] Streaming instantiation for faster loading
- [ ] Custom memory allocator for reduced GC
