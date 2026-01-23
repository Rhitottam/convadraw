import { CloudGrid, type ImageAsset } from '@convadraw/cloudgrid'
import '@convadraw/cloudgrid/cloudgrid.css'
import { useMemo } from 'react'

/**
 * Demo App - Shows how to use CloudGrid with assets
 * 
 * This demonstrates the proper SDK usage:
 * 1. Create assets (the data)
 * 2. Pass them to CloudGrid via initialAssets prop
 * 3. CloudGrid handles rendering and interactions
 */
function App() {
  // Create demo assets - 2000 images in a grid layout
  const demoAssets = useMemo(() => {
    const assets: ImageAsset[] = []
    const IMAGE_COUNT = 2000
    const COLS = 50
    const IMAGE_HEIGHT = 300
    const GAP = 40
    // const CELL_WIDTH = IMAGE_WIDTH + GAP
    // const CELL_HEIGHT = IMAGE_HEIGHT + GAP
    
    const imageSizes = [
      { w: 1920, h: 1080 },
      { w: 1600, h: 900 },
      { w: 1280, h: 720 },
      { w: 1024, h: 768 },
    ]
    
    // Center the grid
    let offsetX = 0
    let offsetY = 0
    
    for (let i = 0; i < IMAGE_COUNT; i++) {
      const col = i % COLS
      const size = imageSizes[i % imageSizes.length]
      const width = Math.floor((size.w/size.h*IMAGE_HEIGHT) / 20) * 20;
      const height = IMAGE_HEIGHT;
      if(col === 0) {
        offsetX = 0;
        offsetY += IMAGE_HEIGHT + GAP;
      }
      assets.push({
        id: `image-${i}`,
        type: 'image',
        x: offsetX,
        y: offsetY,
        w: width,  // Display width
        h: height, // Display height
        src: `https://picsum.photos/seed/cloudgrid${i}/${size.w}/${size.h}`,
        alt: `Demo image ${i}`,
        // Metadata: ONLY intrinsic properties of the source image
        metadata: {
          originalWidth: size.w,
          originalHeight: size.h,
        },
      });
      offsetX += width + GAP;
    }
    
    return assets
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <CloudGrid
        initialAssets={demoAssets}
        gridSize={20}
        snapToGrid={true}
        showGrid={true}
        toolbarPosition="top-left"
        statsPanelPosition="top-right"
        onMount={(wasmInstance) => {
          console.log('CloudGrid mounted with WASM!')
          console.log('Total objects:', wasmInstance.getObjectCount())
          console.log('Assets loaded:', demoAssets.length)
          
          // Log metadata example from first asset
          const firstAsset = demoAssets[0]
          if (firstAsset?.metadata) {
            const scale = (firstAsset.h / firstAsset.metadata.originalHeight) * 100
            console.log('Example asset:', {
              original: `${firstAsset.metadata.originalWidth}x${firstAsset.metadata.originalHeight}`,
              display: `${firstAsset.w}x${firstAsset.h}`,
              scale: `${scale.toFixed(1)}%`,
            })
          }
        }}
        onAssetAdd={(newAssets) => {
          console.log(`📸 ${newAssets.length} new asset(s) added:`)
          newAssets.forEach((asset, idx) => {
            const name = asset.metadata?.fileName || 
                        (asset.type === 'image' ? asset.alt : undefined) ||
                        `${asset.type}-${asset.id}`
            console.log(`  ${idx + 1}. ${name}`)
            if (asset.metadata) {
              console.log(`     Original: ${asset.metadata.originalWidth}x${asset.metadata.originalHeight}`)
              console.log(`     Display:  ${asset.w}x${asset.h}`)
              console.log(`     Uploaded: ${asset.metadata.uploadedAt}`)
            }
          })
        }}
      />
    </div>
  )
}

export default App
