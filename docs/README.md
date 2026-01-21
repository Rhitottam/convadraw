# 📚 CloudGrid Documentation

Welcome to the CloudGrid documentation! This guide will help you understand, use, and contribute to the library.

## 🗺️ Documentation Map

### 🚀 Getting Started
- **[Main README](../README.md)** - Project overview and quick start
- **[Package README](../packages/cloudgrid/README.md)** - Detailed API documentation
- **[Publishing Guide](../PUBLISHING.md)** - How to publish to npm and deploy

### 🏗️ Architecture & Design
- **[Architecture Guide](./ARCHITECTURE.md)** - Complete architecture overview
  - High-level overview
  - Monorepo structure
  - Data flow diagrams
  - Key components explained
  - State management
  - Performance optimizations
  - How to extend the library

- **[Visual Guide](./VISUAL_GUIDE.md)** - Visual diagrams and flows
  - Component hierarchy
  - Data flow visualizations
  - WASM internal structure
  - Rendering pipeline
  - Memory management
  - Critical paths
  - Debugging tips

### 📖 API References
- **[Canvas API](./CANVAS_API.md)** - Canvas component and rendering
- **[WASM API](./WASM_API.md)** - WebAssembly module reference
- **[Camera API](../packages/cloudgrid/CAMERA_API.md)** - Camera controls and animations

### 🤝 Contributing
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute
  - Development setup
  - Workflow
  - Code style
  - PR guidelines
  - Common pitfalls

### 📦 Package Guides
- **[Monorepo Structure](./ARCHITECTURE.md#monorepo-structure)** - Package organization
- **[Build System](../PUBLISHING.md#package-contents)** - How to build packages

## 🎯 Quick Links by Goal

### "I want to use CloudGrid"
1. Start with [Main README](../README.md)
2. Read [Package README](../packages/cloudgrid/README.md) for API
3. Check [Camera API](../packages/cloudgrid/CAMERA_API.md) for controls
4. See [examples in App.tsx](../apps/www/src/App.tsx)

### "I want to understand the architecture"
1. Read [Architecture Guide](./ARCHITECTURE.md) - concepts and patterns
2. Read [Visual Guide](./VISUAL_GUIDE.md) - diagrams and flows
3. Study [Canvas.tsx](../packages/cloudgrid/src/Canvas.tsx) - main component
4. Study [WASM source](../packages/wasm/assembly/) - core engine

### "I want to contribute"
1. Read [Contributing Guide](../CONTRIBUTING.md)
2. Read [Architecture Guide](./ARCHITECTURE.md) 
3. Pick an issue from [GitHub](https://github.com/Rhitottam/convadraw/issues)
4. Follow the development workflow

### "I want to add a new feature"
1. Read ["How to Extend" section](./ARCHITECTURE.md#how-to-extend)
2. Look at similar existing features
3. Follow patterns in the codebase
4. Test with 2000+ items for performance

### "I want to fix a bug"
1. Reproduce the issue locally
2. Check [Common Pitfalls](../CONTRIBUTING.md#common-pitfalls)
3. Use [Debugging Tips](./VISUAL_GUIDE.md#debugging-tips)
4. Submit a PR with the fix

### "I want to optimize performance"
1. Read [Performance Optimizations](./ARCHITECTURE.md#performance-optimizations)
2. Profile with Chrome DevTools
3. Check [Memory Management](./VISUAL_GUIDE.md#memory-management)
4. Test with 2000+ items

## 📊 Documentation Coverage

| Topic | Status | Files |
|-------|--------|-------|
| Getting Started | ✅ Complete | README.md, Package README |
| API Reference | ✅ Complete | CAMERA_API.md, CANVAS_API.md, WASM_API.md |
| Architecture | ✅ Complete | ARCHITECTURE.md, VISUAL_GUIDE.md |
| Contributing | ✅ Complete | CONTRIBUTING.md |
| Examples | ✅ Complete | Package README, App.tsx |
| Tests | ❌ TODO | Need test suite |
| Videos/GIFs | ⚠️ Partial | demo.gif added |
| Deployment | ✅ Complete | PUBLISHING.md, deploy.yml |

## 🎓 Learning Path

### Level 1: Beginner (Use the Library)
**Time: 1-2 hours**
1. ✅ Read Main README
2. ✅ Try basic example
3. ✅ Explore props and hooks
4. ✅ Build something simple

### Level 2: Intermediate (Understand the Library)
**Time: 4-6 hours**
1. ✅ Read Architecture Guide
2. ✅ Study CloudGrid.tsx and Canvas.tsx
3. ✅ Understand state management
4. ✅ Explore Camera and WASM contexts

### Level 3: Advanced (Contribute to the Library)
**Time: 8-12 hours**
1. ✅ Read Visual Guide
2. ✅ Study WASM source
3. ✅ Understand workers
4. ✅ Make your first contribution

### Level 4: Expert (Core Development)
**Time: Ongoing**
1. ✅ Optimize performance
2. ✅ Add major features
3. ✅ Refactor architecture
4. ✅ Mentor other contributors

## 🔍 Search by Topic

### React & UI
- [Component Hierarchy](./VISUAL_GUIDE.md#component-hierarchy)
- [State Management](./ARCHITECTURE.md#state-management)
- [Canvas Component](./CANVAS_API.md)
- [Custom Components](./ARCHITECTURE.md#adding-a-custom-panelcomponent)

### Performance
- [Optimizations](./ARCHITECTURE.md#performance-optimizations)
- [Memory Management](./VISUAL_GUIDE.md#memory-management)
- [Viewport Culling](./ARCHITECTURE.md#1-viewport-culling)
- [Rendering Pipeline](./VISUAL_GUIDE.md#rendering-pipeline)

### WebAssembly
- [WASM API](./WASM_API.md)
- [WASM Structure](./VISUAL_GUIDE.md#wasm-internal-structure)
- [State Sync](./ARCHITECTURE.md#usecanvastorets-state-sync)
- [Commands & History](./WASM_API.md#command-history)

### Camera & Viewport
- [Camera API](../packages/cloudgrid/CAMERA_API.md)
- [CameraContext](./ARCHITECTURE.md#cameracontexttsx-camera-state)
- [Zoom & Pan](./ARCHITECTURE.md#2-camera-operations)
- [Animations](../packages/cloudgrid/CAMERA_API.md#animated-actions)

### Workers
- [Worker Implementation Guide](./WORKER_IMPLEMENTATION.md) - Complete worker setup
- [Worker Optimization Guide](./WORKER_OPTIMIZATION.md) - Performance optimizations
- [Grid Worker](./ARCHITECTURE.md#gridworkerts)
- [Image Loader](./ARCHITECTURE.md#image-loaderworkerts)
- [Worker Communication](./VISUAL_GUIDE.md#receive-imagebitmap-from-worker)

### Tools & Interactions
- [Adding New Tools](./ARCHITECTURE.md#adding-a-new-tool)
- [Custom Events](./ARCHITECTURE.md#adding-a-custom-eventaction)
- [Selection](./ARCHITECTURE.md#2-user-interaction-flow)
- [Drag & Drop](./VISUAL_GUIDE.md#user-moves-an-image)

## 🎯 Common Tasks

### Add a New Tool
1. Read [Adding a New Tool](./ARCHITECTURE.md#adding-a-new-tool)
2. Update `ToolType` enum
3. Add to toolbar UI
4. Handle in Canvas events
5. Update cursor

### Add a Media Type
1. Read [Adding a New Media Type](./ARCHITECTURE.md#adding-a-new-media-type)
2. Update WASM type enum
3. Create Konva node component
4. Add rendering logic
5. Add creation function

### Optimize Performance
1. Profile with Chrome DevTools
2. Check [Performance Tips](./ARCHITECTURE.md#performance-optimizations)
3. Use `memo()` and `useMemo()`
4. Implement viewport culling
5. Use workers for heavy ops

### Debug an Issue
1. Reproduce locally
2. Use [Debugging Tips](./VISUAL_GUIDE.md#debugging-tips)
3. Check state in DevTools
4. Add console logs strategically
5. Profile if performance-related

## 📞 Get Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Rhitottam/convadraw/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Rhitottam/convadraw/discussions)
- 📧 **Email**: support@cloudgrid.dev
- 📖 **Documentation Issues**: Create an issue or PR

## 🎉 Contributing to Docs

Documentation improvements are always welcome!

**How to contribute:**
1. Find something unclear or missing
2. Fork the repo
3. Edit the relevant .md file
4. Submit a PR

**Good documentation:**
- Clear and concise
- Includes examples
- Uses diagrams when helpful
- Links to related sections
- Keeps code snippets up to date

---

**Happy Learning! 📚✨**
