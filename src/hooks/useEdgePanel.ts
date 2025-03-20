
import { useState, useCallback, useRef } from 'react';
import { EdgeData } from '@/types/lineage';
import { closePanelWithAnimation, shouldSkipSelection } from '@/utils/lineage/panelUtils';

export function useEdgePanel() {
  const [selectedEdge, setSelectedEdge] = useState<EdgeData | null>(null);
  const [isEdgePanelOpen, setIsEdgePanelOpen] = useState(false);
  
  // Use ref to track if panel is already open to prevent unnecessary re-renders
  const edgeOpenRef = useRef(false);

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: any) => {
    // Skip work if clicking the same edge when already open
    if (shouldSkipSelection(selectedEdge?.id, edge.id, edgeOpenRef)) return;
    
    // In a real application, you would fetch the edge data from an API
    // Here we're using the edge data directly from the edge object
    const edgeData = edge.data;
    
    // Update edge data and panel state
    setSelectedEdge(edgeData);
    setIsEdgePanelOpen(true);
    edgeOpenRef.current = true;
  }, [selectedEdge?.id]);

  const handleCloseEdgePanel = useCallback(() => {
    closePanelWithAnimation(setIsEdgePanelOpen, setSelectedEdge);
    edgeOpenRef.current = false;
  }, []);

  const resetEdgePanel = useCallback(() => {
    setSelectedEdge(null);
    setIsEdgePanelOpen(false);
    edgeOpenRef.current = false;
  }, []);

  return {
    selectedEdge,
    isEdgePanelOpen,
    edgeOpenRef,
    handleEdgeClick,
    handleCloseEdgePanel,
    resetEdgePanel,
    setSelectedEdge,
    setIsEdgePanelOpen
  };
}
