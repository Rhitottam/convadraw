/**
 * Canvas Constants
 */

// Resize limits (as multipliers of gridSize)
export const MIN_SIZE_MULTIPLIER = 2;
export const MAX_SIZE_MULTIPLIER = 200;

// Selection rectangle interface
export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
