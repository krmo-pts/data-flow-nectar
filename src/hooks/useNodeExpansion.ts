
import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';

export const useNodeExpansion = (nodeId?: string) => {
  const [expanded, setExpanded] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const previousHeightRef = useRef<number | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const reactFlowInstance = useReactFlow();
  
  // Store a reference to the node element
  const setNodeElement = useCallback((element: HTMLDivElement | null) => {
    nodeRef.current = element;
  }, []);
  
  // Toggle expand with position adjustment
  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    
    // Store the current height before collapsing
    if (nodeRef.current && expanded) {
      previousHeightRef.current = nodeRef.current.getBoundingClientRect().height;
    }
    
    setExpanded(prev => !prev);
  }, [expanded]);
  
  // Effect to adjust node position after expanding/collapsing
  useEffect(() => {
    if (!nodeId || !nodeRef.current) return;
    
    // We need to wait for the DOM to update
    const timeoutId = setTimeout(() => {
      if (!expanded && previousHeightRef.current && nodeRef.current) {
        // Get the current node from ReactFlow
        const node = reactFlowInstance.getNode(nodeId);
        if (node) {
          // Calculate height difference and adjust only for the collapsed content
          const currentHeight = nodeRef.current.getBoundingClientRect().height;
          const heightDiff = previousHeightRef.current - currentHeight;
          
          // Adjust node position to prevent jumping
          reactFlowInstance.setNodes(nodes => 
            nodes.map(n => {
              if (n.id === nodeId) {
                return {
                  ...n,
                  position: {
                    ...n.position,
                    y: n.position.y - heightDiff
                  }
                };
              }
              return n;
            })
          );
        }
      } else if (expanded && previousHeightRef.current && nodeRef.current) {
        // Handle expanding as well to ensure smooth transition both ways
        const node = reactFlowInstance.getNode(nodeId);
        if (node) {
          const currentHeight = nodeRef.current.getBoundingClientRect().height;
          const heightDiff = currentHeight - previousHeightRef.current;
          
          reactFlowInstance.setNodes(nodes => 
            nodes.map(n => {
              if (n.id === nodeId) {
                return {
                  ...n,
                  position: {
                    ...n.position,
                    y: n.position.y + heightDiff
                  }
                };
              }
              return n;
            })
          );
        }
      }
    }, 50); // Increased timeout to ensure DOM has updated
    
    return () => clearTimeout(timeoutId);
  }, [expanded, nodeId, reactFlowInstance]);
  
  const toggleShowAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setShowAllColumns(prev => !prev);
  }, []);
  
  return {
    expanded,
    showAllColumns,
    toggleExpand,
    toggleShowAll,
    setNodeElement
  };
};
