# 🤝 Contributing to CloudGrid

Thank you for your interest in contributing to CloudGrid! This guide will help you get started.

## 📚 Before You Start

1. Read the [Architecture Guide](./docs/ARCHITECTURE.md) to understand the codebase
2. Read the [Visual Guide](./docs/VISUAL_GUIDE.md) for diagrams and data flow
3. Check [existing issues](https://github.com/Rhitottam/convadraw/issues) for tasks to work on

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm 10+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Rhitottam/convadraw.git
cd convadraw

# Install dependencies
npm install

# Build all packages
npm run build

# Start demo app
cd apps/www
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
convadraw/
├── packages/
│   ├── cloudgrid/    ← Main React SDK (most contributions here)
│   ├── wasm/         ← WebAssembly module
│   ├── editor/       ← Editor logic
│   ├── state/        ← State management
│   └── primitives/   ← Math utilities
└── apps/
    └── www/          ← Demo app
```

## 🎯 Areas to Contribute

### 🌟 Good First Issues

- Add new toolbar icons/tools
- Improve error messages
- Add TypeScript documentation
- Write usage examples
- Fix bugs

### 🚀 Feature Contributions

- Add new tools (text, draw, shapes)
- Implement video support
- Add export functionality (PNG, SVG)
- Improve mobile support
- Add keyboard shortcuts

### 📖 Documentation

- Improve README examples
- Add JSDoc comments
- Create tutorials
- Record demo videos

### 🐛 Bug Fixes

- Fix reported issues
- Improve error handling
- Optimize performance
- Fix edge cases

## 🔄 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

**For React SDK changes** (`packages/cloudgrid`):
```bash
cd packages/cloudgrid
npm run dev  # Watch mode - auto rebuild
```

**For WASM changes** (`packages/wasm`):
```bash
cd packages/wasm
npm run build
cd ../../packages/cloudgrid
npm run build
```

### 3. Test Your Changes
```bash
cd apps/www
npm run dev
# Test in browser
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug"
```

**Commit Message Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `perf:` Performance improvements
- `refactor:` Code refactoring
- `test:` Add tests
- `chore:` Maintenance tasks

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## ✅ PR Checklist

Before submitting your PR:

- [ ] Code builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] Demo app works (`npm run dev` in apps/www)
- [ ] Added/updated documentation if needed
- [ ] Added examples if adding new features
- [ ] Tested with 2000+ items (performance)
- [ ] Commit messages follow convention

## 🎨 Code Style

### TypeScript
- Use TypeScript for all new code
- Avoid `any` types
- Export types for public APIs
- Add JSDoc comments for public functions

### React
- Use functional components with hooks
- Memoize expensive computations (`useMemo`, `useCallback`)
- Use `memo()` for expensive components
- Avoid inline object/function creation in renders

### Naming
- Components: `PascalCase` (e.g., `Canvas.tsx`)
- Hooks: `use` prefix (e.g., `useCamera`)
- Files: `kebab-case` or `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

## 🧪 Testing (TODO)

Currently, we don't have automated tests, but we welcome contributions to add them!

**Future testing stack:**
- Unit tests: Vitest
- React tests: React Testing Library
- E2E tests: Playwright

## 📝 Documentation Guidelines

### Code Comments
```typescript
/**
 * Normalize item heights while maintaining aspect ratios.
 * 
 * @param itemIds - Optional array of item IDs to normalize
 * @param targetHeight - Optional target height (calculated if not provided)
 * @returns The average height used for normalization
 * 
 * @example
 * ```typescript
 * // Normalize all items
 * const avgHeight = normalizeItemHeights();
 * 
 * // Normalize specific items
 * normalizeItemHeights([1, 2, 3], 350);
 * ```
 */
function normalizeItemHeights(itemIds?: number[], targetHeight?: number): number {
  // ...
}
```

### README Examples
- Keep examples simple and focused
- Show both basic and advanced usage
- Include expected behavior
- Use real-world scenarios

## 🚨 Common Pitfalls

### 1. Forgetting to Sync WASM → React
```typescript
// ❌ BAD
wasm.moveObject(id, x, y);
// React state is now out of sync!

// ✅ GOOD
wasm.moveObject(id, x, y);
syncFromWasm(wasm);  // Sync state
```

### 2. Not Using Batch Operations
```typescript
// ❌ BAD: Creates 2000 undo entries
for (let i = 0; i < 2000; i++) {
  wasm.resizeObject(...);
}

// ✅ GOOD: Creates 20 undo entries
const BATCH_SIZE = 100;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  wasm.beginBatchResize();
  // ... process batch
  wasm.endBatchResize();
}
```

### 3. Not Memoizing Computations
```typescript
// ❌ BAD: Recalculates every render
const visibleImages = images.filter(img => isInViewport(img, bounds));

// ✅ GOOD: Only recalculates when dependencies change
const visibleImages = useMemo(() => 
  images.filter(img => isInViewport(img, bounds)),
  [images, bounds]
);
```

### 4. Creating Objects in Render
```typescript
// ❌ BAD: Creates new object every render → infinite loop
<Component style={{ color: 'red' }} />

// ✅ GOOD: Define outside or use useMemo
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />
```

## 🆘 Getting Help

- **Issues**: [GitHub Issues](https://github.com/Rhitottam/convadraw/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Rhitottam/convadraw/discussions)
- **Email**: support@cloudgrid.dev

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to CloudGrid! 🎉
