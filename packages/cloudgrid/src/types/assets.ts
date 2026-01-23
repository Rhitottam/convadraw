/**
 * Asset types for CloudGrid infinite canvas
 * 
 * This defines the data model for all items that can be added to the canvas.
 * Assets are the user-facing API - they describe WHAT to display.
 * The library handles HOW to render them efficiently.
 */

/**
 * Base properties shared by all asset types
 */
export interface BaseAsset {
  /** Unique identifier for this asset */
  id: string
  
  /** Asset type discriminator */
  type: 'image' | 'video' | 'text' | 'shape' | 'canvas' | 'svg'
  
  /** X position in canvas world coordinates */
  x: number
  
  /** Y position in canvas world coordinates */
  y: number
  
  /** Width in canvas units (display width) */
  w: number
  
  /** Height in canvas units (display height) */
  h: number
  
  /** Rotation in degrees (optional, default: 0) */
  rotation?: number
  
  /** Opacity from 0-1 (optional, default: 1) */
  opacity?: number
  
  /** Z-index for layering (optional, higher = front) */
  zIndex?: number
  
  /** Whether this asset is locked from editing (optional, default: false) */
  locked?: boolean
  
  /** 
   * Metadata - ONLY intrinsic properties of the source asset
   * Do NOT store derived/UI state here (like displayScale, grid positions, etc.)
   * Only store: originalWidth, originalHeight, fileName, fileSize, etc.
   */
  metadata?: Record<string, any>
}

/**
 * Image asset - displays raster images
 */
export interface ImageAsset extends BaseAsset {
  type: 'image'
  
  /** Image source URL or data URL (high-resolution) */
  src: string
  
  /** Thumbnail URL for lower-resolution preview (optional) */
  thumbnail?: string
  
  /** Alt text for accessibility (optional) */
  alt?: string
  
  /** How the image should fit in the bounds (optional, default: 'cover') */
  fit?: 'cover' | 'contain' | 'fill' | 'none'
}

/**
 * Video asset - displays video content
 */
export interface VideoAsset extends BaseAsset {
  type: 'video'
  
  /** Video source URL */
  src: string
  
  /** Poster image URL shown before playback (optional) */
  poster?: string
  
  /** Whether video should autoplay (optional, default: false) */
  autoplay?: boolean
  
  /** Whether video should loop (optional, default: false) */
  loop?: boolean
  
  /** Whether video is muted (optional, default: false) */
  muted?: boolean
}

/**
 * Text asset - displays formatted text
 */
export interface TextAsset extends BaseAsset {
  type: 'text'
  
  /** Text content to display */
  content: string
  
  /** Font size in pixels (optional, default: 16) */
  fontSize?: number
  
  /** Font family (optional, default: system font) */
  fontFamily?: string
  
  /** Font weight (optional, default: 'normal') */
  fontWeight?: string | number
  
  /** Text color (optional, default: black) */
  color?: string
  
  /** Text alignment (optional, default: 'left') */
  align?: 'left' | 'center' | 'right'
  
  /** Line height multiplier (optional, default: 1.2) */
  lineHeight?: number
}

/**
 * Shape types supported
 */
export type ShapeType = 'rect' | 'circle' | 'ellipse' | 'polygon' | 'line'

/**
 * Shape asset - displays geometric shapes
 */
export interface ShapeAsset extends BaseAsset {
  type: 'shape'
  
  /** Shape geometry type */
  shape: ShapeType
  
  /** Fill color (optional, default: transparent) */
  fill?: string
  
  /** Stroke color (optional, default: black) */
  stroke?: string
  
  /** Stroke width in pixels (optional, default: 1) */
  strokeWidth?: number
  
  /** Corner radius for rectangles (optional, default: 0) */
  cornerRadius?: number
  
  /** Points array for polygons/lines [x1, y1, x2, y2, ...] (optional) */
  points?: number[]
}

/**
 * Canvas asset - displays custom canvas/SVG content
 */
export interface CanvasAsset extends BaseAsset {
  type: 'canvas' | 'svg'
  
  /** HTML string or data URL containing the content */
  content: string
}

/**
 * Union type of all supported asset types
 */
export type Asset = ImageAsset | VideoAsset | TextAsset | ShapeAsset | CanvasAsset

/**
 * Asset creation input - omits 'id' which is auto-generated
 */
export type CreateAssetInput = Omit<Asset, 'id'>

/**
 * Partial asset update - only include fields to change
 */
export type UpdateAssetInput = Partial<Omit<Asset, 'id' | 'type'>>

/**
 * Type guard to check if an object is a valid asset
 */
export function isAsset(obj: any): obj is Asset {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'type' in obj &&
    'x' in obj &&
    'y' in obj &&
    'width' in obj &&
    'height' in obj &&
    ['image', 'video', 'text', 'shape', 'canvas', 'svg'].includes(obj.type)
  )
}

/**
 * Type guard for image assets
 */
export function isImageAsset(asset: Asset): asset is ImageAsset {
  return asset.type === 'image'
}

/**
 * Type guard for video assets
 */
export function isVideoAsset(asset: Asset): asset is VideoAsset {
  return asset.type === 'video'
}

/**
 * Type guard for text assets
 */
export function isTextAsset(asset: Asset): asset is TextAsset {
  return asset.type === 'text'
}

/**
 * Type guard for shape assets
 */
export function isShapeAsset(asset: Asset): asset is ShapeAsset {
  return asset.type === 'shape'
}

/**
 * Type guard for canvas/SVG assets
 */
export function isCanvasAsset(asset: Asset): asset is CanvasAsset {
  return asset.type === 'canvas' || asset.type === 'svg'
}

/**
 * Helper to generate a unique asset ID
 */
export function generateAssetId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
