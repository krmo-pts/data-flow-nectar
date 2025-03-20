
import { useMemo } from 'react';
import { Node, Edge, useStore } from 'reactflow';

// Custom selector function for better performance
export const useEdgeOptimizer = (edges: Edge[], nodes: Node[], isDragging = false) => {
  // Get current zoom level to conditionally render edges
  const zoom = useStore((state) => state.transform?.[2] || 1);
  
  // Optimize edges rendering based on zoom level and dragging state
  const visibleEdges = useMemo(() => {
    // During dragging, drastically reduce the number of visible edges
    if (isDragging && edges.length > 50) {
      return edges.slice(0, Math.min(20, edges.length)); // Only show first 20 edges during dragging
    }
    
    // When zoomed out with many edges, hide more edges
    if (zoom < 0.5 && edges.length > 100) {
      // Show fewer edges when zoomed out
      return edges.filter((_, index) => index % Math.ceil(edges.length / 100) === 0);
    }
    
    if (zoom < 0.8 && edges.length > 200) {
      // Show a subset of edges based on zoom level
      return edges.filter((_, index) => index % Math.ceil(edges.length / 200) === 0);
    }
    
    return edges;
  }, [edges, zoom, isDragging]);

  return {
    visibleEdges,
    zoom
  };
};
