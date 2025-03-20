
import { useMemo } from 'react';

/**
 * Options configuration for ReactFlow instance
 */
export const useFlowOptions = () => {
  return useMemo(() => ({
    maxZoom: 2,
    minZoom: 0.2,
    snapToGrid: true,
    snapGrid: [15, 15] as [number, number],
    nodesDraggable: true,
    elevateEdgesOnSelect: true,
    elevateNodesOnSelect: true,
    focusable: true,
  }), []);
};
