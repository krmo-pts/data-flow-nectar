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
          // Calculate height difference
          const currentHeight = nodeRef.current.getBoundingClientRect().height;
          const heightDiff = previousHeightRef.current - currentHeight;
          
          // When collapsing, we want to keep the header in place (top of node)
          // so we move the node up by the full height difference
          reactFlowInstance.setNodes(nodes => 
            nodes.map(n => {
              if (n.id === nodeId) {
                return {
                  ...n,
                  position: {
                    ...n.position,
                    y: n.position.y
                  }
                };
              }
              return n;
            })
          );
        }
      } else if (expanded && previousHeightRef.current && nodeRef.current) {
        // When expanding, we also want to keep the header in place
        // so we don't need to adjust the Y position
        const node = reactFlowInstance.getNode(nodeId);
        if (node) {
          const currentHeight = nodeRef.current.getBoundingClientRect().height;
          
          reactFlowInstance.setNodes(nodes => 
            nodes.map(n => {
              if (n.id === nodeId) {
                return {
                  ...n,
                  position: {
                    ...n.position,
                    y: n.position.y
                  }
                };
              }
              return n;
            })
          );
        }
      }
    }, 0); // Use 0 to run as soon as the current call stack is empty
    
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

