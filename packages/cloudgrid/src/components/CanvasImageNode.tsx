/**
 * CanvasImageNode Component
 * 
 * Renders an individual image on the canvas with:
 * - On-demand loading with LOD (Level of Detail)
 * - Selection support
 * - Drag and drop
 * - Conditional draggability based on tool and pinch state
 */

import type { ToolType } from '@convadraw/state';
import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Image as KonvaImage, Rect } from 'react-konva';
import { useImageOnDemand } from '../lib/imageLoading';
import type { CanvasImage } from '../types/canvas';

export interface CanvasImageNodeProps {
  image: CanvasImage;
  isSelected: boolean;
  onSelect: (shiftKey: boolean) => void;
  onDragStart: () => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, newX: number, newY: number) => void;
  activeTool: ToolType;
  scale: number;
  isPinching: boolean;
  nodeRef?: (node: Konva.Image | null) => void;
}

export function CanvasImageNode({
  image,
  isSelected,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  activeTool,
  scale,
  isPinching,
  nodeRef,
}: CanvasImageNodeProps) {
  const shapeRef = useRef<Konva.Image>(null);

  const displayWidth = image.width * scale;
  const displayHeight = image.height * scale;

  // isVisible is always true since this component is only rendered for visible images
  const bitmap = useImageOnDemand(image.src, displayWidth, displayHeight, true);

  useEffect(() => {
    if (nodeRef) nodeRef(shapeRef.current);
  }, [nodeRef, bitmap]);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'select') {
      onSelect(e.evt.shiftKey);
    }
  };

  const handleDragStart = () => {
    onDragStart();
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragMove(image.id, node.x(), node.y());
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd(image.id, node.x(), node.y());
  };

  const isDraggable = activeTool === 'select' && !isPinching;

  if (!bitmap) {
    return (
      <Rect
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        fill="rgba(100, 100, 100, 0.3)"
        stroke={isSelected ? '#4ade80' : 'rgba(150, 150, 150, 0.5)'}
        strokeWidth={isSelected ? 2 : 1}
        draggable={isDraggable}
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      />
    );
  }

  return (
    <KonvaImage
      ref={shapeRef}
      id={image.id}
      image={bitmap}
      x={image.x}
      y={image.y}
      width={image.width}
      height={image.height}
      draggable={isDraggable}
      onClick={handleClick}
      onTap={() => onSelect(false)}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      stroke={isSelected ? '#4ade80' : undefined}
      strokeWidth={isSelected ? 2 / scale : 0}
    />
  );
}
