
import { useCallback } from 'react';
import { EdgeChange, Edge, Connection, addEdge, MarkerType } from 'reactflow';

interface UseEdgeHandlerProps {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: (changes: EdgeChange[]) => void;
  isDragging: boolean;
  setNodes?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useEdgeHandler({ setEdges, onEdgesChange, isDragging, setNodes }: UseEdgeHandlerProps) {
  // Handle edge changes - skip during dragging for better performance
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Apply changes to the local state immediately
    onEdgesChange(changes);
    
    // Only update the main state if not dragging
    if (!isDragging) {
      // Check if we have removal changes
      const removalChanges = changes.filter(change => change.type === 'remove');
      
      if (removalChanges.length > 0 && setNodes) {
        // Get the IDs of the removed edges
        const removedEdgeIds = removalChanges.map(change => change.id);
        
        // Update edges state to remove these edges
        setEdges(prevEdges => {
          // Store the information about edges being removed
          const edgesToRemove = prevEdges.filter(edge => removedEdgeIds.includes(edge.id));
          
          // Remove the deleted edges
          const updatedEdges = prevEdges.filter(edge => !removedEdgeIds.includes(edge.id));
          
          // If we have a setNodes function, remove the connected nodes
          if (setNodes && edgesToRemove.length > 0) {
            setNodes(prevNodes => {
              // Extract node IDs that should be removed
              const nodesToRemove = new Set<string>();
              const connectedNodeIds = new Set<string>();
              
              // For each edge being removed, add both source and target to the nodesToRemove set
              edgesToRemove.forEach(edge => {
                nodesToRemove.add(edge.source);
                nodesToRemove.add(edge.target);
              });
              
              // Get all active edges after removal
              const remainingEdges = updatedEdges.filter(edge => !edge.hidden);
              
              // For each remaining edge, add both source and target to connectedNodeIds
              remainingEdges.forEach(edge => {
                connectedNodeIds.add(edge.source);
                connectedNodeIds.add(edge.target);
              });
              
              // Only remove nodes that aren't connected to any remaining edges
              const finalNodesToRemove = Array.from(nodesToRemove).filter(
                nodeId => !connectedNodeIds.has(nodeId)
              );
              
              console.log('Removing nodes after edge deletion:', finalNodesToRemove);
              
              // Remove the unconnected nodes
              return prevNodes.filter(node => !finalNodesToRemove.includes(node.id));
            });
          }
          
          return updatedEdges;
        });
      } else {
        // Handle other non-removal changes
        setEdges(prev => prev);
      }
    }
  }, [onEdgesChange, setEdges, isDragging, setNodes]);

  // Handle edge connections
  const handleConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => 
        addEdge({
          ...params,
          data: { label: 'New Connection' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#64748b',
          },
          type: 'default',
        }, eds)
      );
    },
    [setEdges]
  );

  return {
    handleEdgesChange,
    handleConnect
  };
}
