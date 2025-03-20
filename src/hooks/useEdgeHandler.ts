
import { useCallback } from 'react';
import { EdgeChange, Edge, Connection, addEdge, MarkerType } from 'reactflow';

interface UseEdgeHandlerProps {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: (changes: EdgeChange[]) => void;
  isDragging: boolean;
}

export function useEdgeHandler({ setEdges, onEdgesChange, isDragging }: UseEdgeHandlerProps) {
  // Handle edge changes - skip during dragging for better performance
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Apply changes to the local state immediately
    onEdgesChange(changes);
    
    // Only update the main state if not dragging
    if (!isDragging) {
      setEdges(prev => {
        // Only handle removal changes to avoid unnecessary updates
        if (changes.some(change => change.type === 'remove')) {
          return prev.filter(edge => 
            !changes.some(change => 
              change.type === 'remove' && change.id === edge.id
            )
          );
        }
        return prev;
      });
    }
  }, [onEdgesChange, setEdges, isDragging]);

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
