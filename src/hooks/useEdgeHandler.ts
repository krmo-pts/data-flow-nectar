
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
      
      if (removalChanges.length > 0) {
        // Get the IDs of the removed edges
        const removedEdgeIds = removalChanges.map(change => change.id);
        
        // Update edges state to remove these edges
        setEdges(prevEdges => {
          // Store the connections that are being removed to know which nodes to remove
          const removedConnections = prevEdges
            .filter(edge => removedEdgeIds.includes(edge.id))
            .map(edge => ({ source: edge.source, target: edge.target }));
          
          // Remove the deleted edges
          const updatedEdges = prevEdges.filter(edge => !removedEdgeIds.includes(edge.id));
          
          // If we have a setNodes function, remove the connected nodes as well
          if (setNodes && removedConnections.length > 0) {
            setNodes(prevNodes => {
              // Extract node IDs that should be removed
              const nodesToRemove = new Set<string>();
              
              // Add source and target nodes of removed edges to the removal set
              removedConnections.forEach(conn => {
                nodesToRemove.add(conn.source);
                nodesToRemove.add(conn.target);
              });
              
              console.log('Removing nodes connected to deleted edges:', Array.from(nodesToRemove));
              
              // Remove the connected nodes
              return prevNodes.filter(node => !nodesToRemove.has(node.id));
            });
          }
          
          return updatedEdges;
        });
      } else {
        // Handle other non-removal changes
        setEdges(prev => {
          // Only update for specific change types if needed
          return prev;
        });
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
