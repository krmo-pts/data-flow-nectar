
import { useMemo } from 'react';
import { Node, Edge } from 'reactflow';

// Custom selector function for better performance
const edgeSelector = (state: any) => ({
  transform: state.transform,
});

/**
 * Hook to optimize edges rendering based on zoom level and dragging state
 */
export const useEdgeOptimizer = (edges: Edge[], nodes: Node[], isDragging = false) => {
  // Get current zoom level to conditionally render edges
  const { transform } = useEdgeSelector();
  const zoom = transform && Array.isArray(transform) ? transform[2] : 1;
  
  // Optimize edges rendering based on zoom level and dragging state
  const visibleEdges = useMemo(() => {
    // During dragging, drastically reduce the number of visible edges
    if (isDragging && edges.length > 50) {
      return edges.slice(0, 50); // Only show first 50 edges during dragging
    }
    
    // When zoomed out with many edges, hide edges between distant nodes
    if (zoom < 0.5 && edges.length > 100) {
      return edges.filter(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return false;
        
        // Calculate distance between nodes
        const dx = source.position.x - target.position.x;
        const dy = source.position.y - target.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only show edges for relatively close nodes when zoomed out
        return distance < 800;
      });
    }
    
    return edges;
  }, [edges, nodes, zoom, isDragging]);

  return {
    visibleEdges,
    zoom
  };
};

// Separate the selector hook to prevent infinite updates
const useEdgeSelector = () => {
  try {
    return edgeSelector({}); // Return default if store is not accessible
  } catch (e) {
    return { transform: [0, 0, 1] };
  }
};
