# 🏗️ CloudGrid Architecture Guide

## 📖 Table of Contents
1. [High-Level Overview](#high-level-overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Data Flow](#data-flow)
4. [Key Components](#key-components)
5. [State Management](#state-management)
6. [Performance Optimizations](#performance-optimizations)
7. [How to Extend](#how-to-extend)

---

## 🎯 High-Level Overview

CloudGrid is a **high-performance infinite canvas library** that can handle 2000+ media items at 60 FPS.

### Core Philosophy
```
Performance First → WebAssembly for heavy operations
Memory Efficient → Viewport culling + LOD + Blob caching
Developer Friendly → React hooks + Context API + Simple props
Extensible → Component slots + Custom events + Hooks
```

### Technology Stack
```
┌─────────────────────────────────────────────────────────┐
│                    React 18 (UI)                        │
├─────────────────────────────────────────────────────────┤
│   Konva.js (Canvas Rendering) + react-konva            │
├─────────────────────────────────────────────────────────┤
│   WebAssembly (AssemblyScript) - Spatial Operations    │
├─────────────────────────────────────────────────────────┤
│   Web Workers - Grid Rendering + Image Processing      │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Monorepo Structure

```
cloudgrid/
├── packages/
│   ├── cloudgrid/          ← Main React SDK (THIS IS THE CORE)
│   │   ├── src/
│   │   │   ├── CloudGrid.tsx          # Main component (entry point)
│   │   │   ├── Canvas.tsx             # Konva canvas + media rendering
│   │   │   ├── CameraContext.tsx      # Camera state (zoom/pan)
│   │   │   ├── WasmContext.tsx        # WASM instance provider
│   │   │   ├── CompactToolbar.tsx     # Tool selection UI
│   │   │   ├── StatsPanel.tsx         # Stats + controls UI
│   │   │   ├── hooks/
│   │   │   │   ├── useCanvasStore.ts  # WASM state sync
│   │   │   │   └── useCameraState.ts  # Camera state sync
│   │   │   ├── workers/
│   │   │   │   ├── createWorker.ts    # Worker factory (inlined as blobs)
│   │   │   │   ├── grid.worker.ts     # Grid dot rendering
│   │   │   │   └── image-loader.worker.ts  # Image loading + LOD
│   │   │   ├── lib/
│   │   │   │   └── grid-utils.ts      # Grid snapping utilities
│   │   │   ├── utils/
│   │   │   │   └── wasmLoader.ts      # WASM initialization
│   │   │   └── helpers.ts             # Public utility functions
│   │   └── package.json
│   │
│   ├── wasm/                ← WebAssembly Module
│   │   ├── assembly/
│   │   │   ├── index.ts              # Public WASM API
│   │   │   ├── canvas-manager.ts     # Main canvas state
│   │   │   ├── quadtree.ts           # Spatial indexing
│   │   │   ├── viewport.ts           # Camera + viewport culling
│   │   │   ├── grid.ts               # Grid snapping
│   │   │   └── commands.ts           # Undo/redo system
│   │   └── build/                    # Compiled WASM output
│   │
│   ├── editor/              ← Framework-agnostic editor logic
│   ├── state/               ← State management primitives
│   └── primitives/          ← Math utilities (Vec, Box, etc.)
│
└── apps/
    └── www/                 ← Demo application
        └── src/App.tsx      # Example usage
```

---

## 🔄 Data Flow

### 1. Initialization Flow
```
User imports CloudGrid
         ↓
CloudGrid.tsx loads WASM (wasmLoader.ts)
         ↓
WASM creates canvas state (canvas-manager.ts)
         ↓
React state syncs with WASM (useCanvasStore.ts)
         ↓
Canvas.tsx renders Konva stage with media items
         ↓
Workers start (grid.worker.ts + image-loader.worker.ts)
```

### 2. User Interaction Flow
```
User drags an image
         ↓
Konva onDragEnd event fires (Canvas.tsx)
         ↓
Call wasm.moveObject() with new position
         ↓
WASM updates quadtree + history (canvas-manager.ts)
         ↓
syncFromWasm() updates React state (useCanvasStore.ts)
         ↓
React re-renders affected components
         ↓
Konva updates visual position
```

### 3. Viewport Culling Flow
```
User pans/zooms canvas
         ↓
CameraContext updates scale + stagePos
         ↓
Canvas calculates viewport bounds
         ↓
useMemo filters visible images from all images
         ↓
Only visible images are rendered to Konva
         ↓
Grid worker renders dots (offscreen)
         ↓
Image worker loads/decodes needed bitmaps
```

---

## 🧩 Key Components

### **CloudGrid.tsx** (Entry Point)
**Purpose:** Main component that orchestrates everything

**Responsibilities:**
- Load WASM module
- Provide context (WasmProvider, CameraProvider)
- Render Canvas + Toolbars
- Handle props → internal state
- Initialize with 2000 demo images

**Key Props:**
```typescript
toolbarPosition?: 'top-left' | 'top-right' | ...
statsPanelPosition?: 'top-left' | 'top-right' | ...
showToolbar?: boolean
showStatsPanel?: boolean
components?: { toolbar, statsPanel, ... }
onMount?: (wasm) => void
```

---

### **Canvas.tsx** (Rendering Engine)
**Purpose:** Core rendering logic using Konva.js

**Responsibilities:**
- Render Konva Stage + Layer
- Viewport culling (only render visible items)
- Handle interactions (select, drag, resize, pan, zoom)
- Manage image nodes (CanvasImageNode components)
- Grid rendering (via worker)
- Image loading (via worker + LOD)
- Selection state (single + multi-select)
- Rubber band selection
- Group operations (move, resize)
- Color sorting with animation

**Key State:**
```typescript
images: CanvasImage[]           // All items from WASM
selectedIds: string[]           // Currently selected
scale: number                   // Zoom level
stagePos: { x, y }             // Camera position
visibleImages: CanvasImage[]    // Viewport-culled items
```

**Performance Techniques:**
- `memo()` wrapper to prevent unnecessary re-renders
- `useMemo` for viewport culling
- Only render visible images
- ImageBitmap for efficient image transfer
- Blob caching in worker

---

### **CameraContext.tsx** (Camera State)
**Purpose:** Centralized camera/viewport management

**Provides:**
```typescript
scale: number                   // Current zoom
stagePos: { x, y }             // Camera position
zoom(factor)                    // Zoom by factor
zoomTo(scale)                   // Zoom to specific level
pan(dx, dy)                     // Pan camera
resetView()                     // Reset to origin
animateToPosition(x, y, scale) // Smooth animation
zoomToFit(bounds)              // Fit bounds in view
```

**Why Separate Context?**
- Avoid prop drilling
- Allow toolbar/stats to access camera
- Debounced WASM sync (150ms)
- Consistent camera state across components

---

### **WasmContext.tsx** (WASM Access)
**Purpose:** Provide WASM instance to all components

**Provides:**
```typescript
useWasm()                      // Get WASM (nullable)
useWasmRequired()              // Get WASM (throws if null)
```

**Why Context?**
- No manual prop drilling
- Auto-available in all child components
- Type-safe access
- Clean developer experience

---

### **useCanvasStore.ts** (State Sync)
**Purpose:** Sync WASM state ↔ React state

**Key Functions:**
```typescript
useCanvasStore()               // Subscribe to WASM state
useCanvasActions()             // Get mutation functions
syncFromWasm(wasm)             // Read WASM → React
registerAsset(src)             // Asset registry
getNumericId(stringId)         // ID conversion
```

**How It Works:**
```
WASM state changes
    ↓
Call syncFromWasm(wasm)
    ↓
Read all objects from WASM (getObjectCount, getObjectIdAtIndex, ...)
    ↓
Build images array
    ↓
Update React state via useSyncExternalStore
    ↓
Components re-render with new state
```

**Asset Registry:**
Maps `assetId` (number) ↔ `src` (string URL)
- WASM only stores numbers (assetId)
- React needs URLs for rendering
- Registry keeps them in sync

---

### **Workers** (Background Processing)

#### **grid.worker.ts**
**Purpose:** Render grid dots on OffscreenCanvas

**Flow:**
```
Canvas sends message: { scale, stagePos, gridSize, ... }
    ↓
Worker calculates visible grid range
    ↓
Draws dots on OffscreenCanvas
    ↓
Creates ImageBitmap
    ↓
Sends ImageBitmap back (transferred, not copied)
    ↓
Canvas renders bitmap as Konva Image
```

**Why Worker?**
- Grid calculation is CPU-intensive
- Keep main thread for interactions
- Smooth 60 FPS even with complex grids

#### **image-loader.worker.ts**
**Purpose:** Load images + generate LOD levels + extract colors

**Flow:**
```
Canvas requests image: { src, level: 'small' | 'medium' | 'full' }
    ↓
Worker checks blob cache
    ↓
If not cached: fetch() → store blob
    ↓
Decode blob at requested resolution
    ↓
Sample pixels for dominant color (R, G, B)
    ↓
Send ImageBitmap + color back
    ↓
Canvas renders, stores in decodedBitmaps Map
```

**LOD Levels:**
```typescript
small: 150px   // Thumbnails when zoomed out
medium: 400px  // Normal view
full: 0        // Original resolution when zoomed in
```

**Memory Optimization:**
- Worker caches compressed blobs (~100-200KB each)
- Main thread only holds decoded bitmaps for VISIBLE images
- Bitmaps closed when images leave viewport
- Result: ~400MB for 2000 images (vs 6GB without optimization)

---

## 🗄️ State Management

### **Three State Layers:**

```
┌─────────────────────────────────────────────────────┐
│  React State (UI Layer)                             │
│  - selectedIds, dimensions, tool, colorsLoaded      │
│  - Fast, reactive, local to components              │
└─────────────────────────────────────────────────────┘
                    ↕ syncFromWasm()
┌─────────────────────────────────────────────────────┐
│  WASM State (Data Layer)                            │
│  - Object positions, dimensions, types              │
│  - Quadtree, viewport, history, grid                │
│  - Single source of truth for canvas data           │
└─────────────────────────────────────────────────────┘
                    ↕ Worker messages
┌─────────────────────────────────────────────────────┐
│  Worker State (Async Layer)                         │
│  - Cached blobs, decoded bitmaps, grid cache        │
│  - Independent, async processing                    │
└─────────────────────────────────────────────────────┘
```

### **When to Update Which Layer:**

| Action | React | WASM | Worker |
|--------|-------|------|--------|
| Select item | ✅ `setSelectedIds` | ❌ | ❌ |
| Move item | ✅ Konva animation | ✅ `wasm.moveObject` | ❌ |
| Pan/Zoom | ✅ `CameraContext` | ⏱️ Debounced | ✅ Grid update |
| Add item | ✅ `syncFromWasm` | ✅ `wasm.addObject` | ✅ Load image |
| Change tool | ✅ `setActiveTool` | ❌ | ❌ |

---

## ⚡ Performance Optimizations

### **1. Viewport Culling**
```typescript
// Canvas.tsx
const visibleImages = useMemo(() => {
  const bounds = calculateViewportBounds(scale, stagePos, dimensions);
  return images.filter(img => isInViewport(img, bounds));
}, [images, scale, stagePos, dimensions]);

// Only render visibleImages, not all 2000!
```

### **2. React Optimization**
```typescript
// Memoize components
export const Canvas = memo(function Canvas({ ... }) { ... });

// Separate Stats from Toolbar (prevent re-render)
<Stats visible={visible} total={total} fps={fps} />

// Only update if values changed
if (prevStats.visible !== visible || ...) {
  setStats({ visible, total, fps });
}
```

### **3. Konva Optimization**
```typescript
// Listen mode for better drag performance
listening: activeTool === 'select'

// Perfect draw disabled for speed
perfectDrawEnabled: false

// Only attach transformer to selected items
if (isSelected) {
  transformerRef.current?.nodes([node]);
}
```

### **4. WASM Optimization**
```typescript
// Quadtree for O(log n) spatial queries
class Quadtree {
  queryViewport(bounds) {
    // Only check items in viewport
    // vs checking all 2000 items
  }
}

// Batch operations for history
beginBatchMove()
  for (items) addToBatchMove(id, x, y)
endBatchMove()
// ↑ Creates 1 undo entry instead of N
```

### **5. Image Loading Strategy**
```typescript
// Load priority:
1. Visible images at appropriate LOD
2. Nearby images (preload)
3. Avoid loading off-screen images

// Blob caching:
Worker: fetch → store blob → decode on demand
Main thread: only decoded bitmaps for visible images
```

---

## 🔨 How to Extend

### **Adding a New Tool**

1. **Add to state enum** (`packages/state/src/types.ts`):
```typescript
export type ToolType = 'select' | 'pan' | 'draw' | 'text';
```

2. **Update toolbar** (`CompactToolbar.tsx`):
```typescript
<Button
  variant={activeTool === 'draw' ? 'default' : 'ghost'}
  onClick={() => onToolChange('draw')}
>
  <PencilSimple size={20} />
</Button>
```

3. **Handle in Canvas** (`Canvas.tsx`):
```typescript
const handleStageClick = useCallback((e) => {
  if (activeTool === 'draw') {
    startDrawing(e.evt.clientX, e.evt.clientY);
  }
  // ... existing logic
}, [activeTool]);
```

4. **Update cursor**:
```typescript
const getCursor = () => {
  if (activeTool === 'draw') return 'crosshair';
  // ... existing logic
};
```

---

### **Adding a New Media Type**

1. **Update WASM** (`packages/wasm/assembly/canvas-manager.ts`):
```typescript
// Types: 0 = image, 1 = video, 2 = text
export function addObject(
  x: f32, y: f32, width: f32, height: f32,
  assetId: u32, type: u32  // ← Use type param
): u32 { ... }
```

2. **Update Canvas rendering** (`Canvas.tsx`):
```typescript
// Add new node type
function TextNode({ text, x, y, fontSize }: TextNodeProps) {
  return (
    <Text
      text={text}
      x={x}
      y={y}
      fontSize={fontSize}
      fill="white"
    />
  );
}

// Render based on type
{visibleImages.map(img => {
  if (img.type === 2) return <TextNode key={img.id} ... />;
  return <CanvasImageNode key={img.id} ... />;
})}
```

3. **Add to actions** (`useCanvasStore.ts`):
```typescript
const addText = useCallback((x, y, text, fontSize) => {
  const textId = registerAsset(text);
  wasm.addObject(x, y, fontSize * text.length, fontSize, textId, 2);
  syncFromWasm(wasm);
}, [wasm]);
```

---

### **Adding a Custom Event/Action**

1. **Create helper** (`helpers.ts`):
```typescript
export function duplicateSelected(): void {
  window.dispatchEvent(new CustomEvent('duplicate-selected'));
}
```

2. **Listen in Canvas** (`Canvas.tsx`):
```typescript
useEffect(() => {
  const handleDuplicate = () => {
    selectedIds.forEach(id => {
      const numericId = getNumericId(id);
      // ... get object data from WASM
      // ... create duplicate at offset position
      wasm.addObject(x + 50, y + 50, width, height, assetId, type);
    });
    syncFromWasm(wasm);
  };
  
  window.addEventListener('duplicate-selected', handleDuplicate);
  return () => window.removeEventListener('duplicate-selected', handleDuplicate);
}, [selectedIds, wasm]);
```

3. **Use in app**:
```typescript
import { duplicateSelected } from '@convadraw/cloudgrid';

<button onClick={duplicateSelected}>Duplicate</button>
```

---

### **Adding a Custom Panel/Component**

```typescript
import { useWasm, useCamera } from '@convadraw/cloudgrid';

function CustomPanel() {
  const wasm = useWasm();
  const camera = useCamera();
  
  const exportCanvas = () => {
    if (!wasm) return;
    
    const data = {
      zoom: camera.scale,
      position: camera.stagePos,
      itemCount: wasm.getObjectCount(),
    };
    
    console.log('Export:', data);
  };
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2">
      <button onClick={exportCanvas}>Export</button>
    </div>
  );
}

// Use it:
<CloudGrid>
  <CustomPanel />
</CloudGrid>
```

---

## 📝 Common Patterns

### **Pattern 1: Accessing WASM**
```typescript
// In any component inside <CloudGrid>
const wasm = useWasm();

if (!wasm) return <div>Loading...</div>;

const count = wasm.getObjectCount();
```

### **Pattern 2: Camera Operations**
```typescript
const camera = useCamera();

// Immediate
camera.setScale(2.0);
camera.setStagePos({ x: 0, y: 0 });

// Animated
camera.animateToPosition(100, 200, 1.5, 500);
camera.zoomToFit({ x: 0, y: 0, width: 800, height: 600 });
```

### **Pattern 3: Custom Events**
```typescript
// Dispatch
window.dispatchEvent(new CustomEvent('my-action', {
  detail: { data: 'value' }
}));

// Listen (in Canvas or component)
useEffect(() => {
  const handler = (e: Event) => {
    const { data } = (e as CustomEvent).detail;
    // ... handle
  };
  window.addEventListener('my-action', handler);
  return () => window.removeEventListener('my-action', handler);
}, []);
```

### **Pattern 4: Syncing State**
```typescript
// After any WASM mutation:
wasm.moveObject(...);
syncFromWasm(wasm);  // ← Update React state

// For batch operations:
wasm.beginBatchMove();
items.forEach(item => wasm.addToBatchMove(...));
wasm.endBatchMove();
syncFromWasm(wasm);  // ← Single sync at end
```

---

## 🎓 Learning Path

### **Level 1: Use the Library**
1. Read `packages/cloudgrid/README.md`
2. Study `apps/www/src/App.tsx`
3. Try different props and components

### **Level 2: Understand React Layer**
1. Read `CloudGrid.tsx` (entry point)
2. Read `CameraContext.tsx` and `WasmContext.tsx`
3. Study `useCanvasStore.ts` (state sync)
4. Look at `CompactToolbar.tsx` and `StatsPanel.tsx`

### **Level 3: Understand Rendering**
1. Deep dive into `Canvas.tsx` (main component)
2. Study viewport culling logic
3. Understand Konva integration
4. Learn worker communication

### **Level 4: Understand WASM**
1. Read `packages/wasm/assembly/index.ts` (API)
2. Study `canvas-manager.ts` (state)
3. Learn `quadtree.ts` (spatial indexing)
4. Understand `commands.ts` (undo/redo)

### **Level 5: Contribute**
1. Add a new tool/feature
2. Optimize performance
3. Add tests
4. Update documentation

---

## 🚀 Quick Reference

### **File → Purpose**
| File | Purpose |
|------|---------|
| `CloudGrid.tsx` | Entry point, orchestration |
| `Canvas.tsx` | Rendering + interactions |
| `CameraContext.tsx` | Camera state |
| `WasmContext.tsx` | WASM access |
| `useCanvasStore.ts` | State sync WASM ↔ React |
| `CompactToolbar.tsx` | Tool selection UI |
| `StatsPanel.tsx` | Stats + controls UI |
| `grid.worker.ts` | Grid rendering (worker) |
| `image-loader.worker.ts` | Image loading (worker) |
| `wasmLoader.ts` | WASM initialization |
| `helpers.ts` | Public utility functions |

### **Key Concepts**
- **WASM**: Single source of truth for canvas data
- **React**: UI layer, synced from WASM
- **Workers**: Async heavy operations
- **Context**: Clean state access (Camera, WASM)
- **Batch Operations**: Group changes for performance
- **Viewport Culling**: Only render visible items
- **LOD**: Dynamic image resolution
- **Custom Events**: Decouple components

---

**Happy Contributing! 🎉**

Questions? Check the other docs or dive into the code!
