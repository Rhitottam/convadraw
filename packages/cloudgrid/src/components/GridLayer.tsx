/**
 * GridLayer Component
 * 
 * Renders the grid dots in the background using an OffscreenCanvas worker.
 * Throttles updates for better performance.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { createGridWorker } from '../workers/createWorker';

export interface GridLayerProps {
  width: number;
  height: number;
  gridSize: number;
  stageX: number;
  stageY: number;
  scale: number;
}

export function GridLayer({ width, height, gridSize, stageX, stageY, scale }: GridLayerProps) {
  const [gridBitmap, setGridBitmap] = useState<ImageBitmap | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(false);
  const lastParamsRef = useRef({ width: 0, height: 0, gridSize: 0, stageX: 0, stageY: 0, scale: 1 });
  
  const throttledParams = useMemo(
    () => {
        
        return ({
      width,
      height,
      gridSize,
      stageX: Math.round(stageX / 5) * 5,
      stageY: Math.round(stageY / 5) * 5,
      scale: Math.round(scale * 100) / 100,
    })},
    [width, height, gridSize, Math.round(stageX / 5), Math.round(stageY / 5), Math.round(scale * 100)]
  );
  

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = createGridWorker()
      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'rendered' && e.data.bitmap) {
          setGridBitmap(e.data.bitmap);
          pendingRef.current = false;
        }
      };
    }
    


    const last = lastParamsRef.current;
    if (
      last.width === throttledParams.width &&
      last.height === throttledParams.height &&
      last.gridSize === throttledParams.gridSize &&
      last.stageX === throttledParams.stageX &&
      last.stageY === throttledParams.stageY &&
      last.scale === throttledParams.scale
    )
      return;

    lastParamsRef.current = { ...throttledParams };
    if (!workerRef.current) return;

    pendingRef.current = true;
    workerRef.current.postMessage({ type: 'render', ...throttledParams });
  }, [throttledParams]);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
    },
    []
  );

  if (!gridBitmap) return null;

  return (
    <KonvaImage
      image={gridBitmap}
      x={-stageX / scale}
      y={-stageY / scale}
      width={width / scale}
      height={height / scale}
      listening={false}
    />
  );
}
