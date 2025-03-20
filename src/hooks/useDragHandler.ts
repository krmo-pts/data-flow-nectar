
import { useCallback, useState } from 'react';
import { NodeChange, NodePositionChange, Node } from 'reactflow';

interface UseDragHandlerProps {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
}

export function useDragHandler({ setNodes, onNodesChange }: UseDragHandlerProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Handle node changes with improved drag detection
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply changes to the local state immediately for smooth UI update
    onNodesChange(changes);
    
    // Find position changes to detect dragging
    const positionChange = changes.find(
      (change): change is NodePositionChange => change.type === 'position'
    );
    
    // If we have a position change, check its dragging status
    if (positionChange) {
      const wasDragging = isDragging;
      const isDraggingNow = !!positionChange.dragging;
      
      if (wasDragging !== isDraggingNow) {
        console.log('Node drag state changed:', {
          nodeId: positionChange.id,
          isDragging: isDraggingNow,
          wasDragging: wasDragging
        });
        setIsDragging(isDraggingNow);
      }
      
      // Only update the main state after drag completes to avoid excessive updates
      if (!positionChange.dragging && positionChange.position) {
        console.log('Finalizing node position after drag:', {
          nodeId: positionChange.id,
          position: positionChange.position
        });
        
        // Update node positions in the main state
        setNodes(prevNodes => 
          prevNodes.map(node => 
            node.id === positionChange.id 
              ? { ...node, position: positionChange.position || node.position }
              : node
          )
        );
      }
    }
  }, [onNodesChange, setNodes, isDragging]);

  return { 
    isDragging, 
    handleNodesChange 
  };
}
