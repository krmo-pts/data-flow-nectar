
import { useState, useCallback, useRef } from 'react';
import { NodeData, EdgeData } from '@/types/lineage';

export function useDetailsPanels() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<EdgeData | null>(null);
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isEdgePanelOpen, setIsEdgePanelOpen] = useState(false);
  
  // Use refs to track if panel is already open to prevent unnecessary re-renders
  const nodeOpenRef = useRef(false);
  const edgeOpenRef = useRef(false);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    // Skip work if clicking the same node when already open
    if (nodeOpenRef.current && selectedNode?.id === node.id) return;
    
    // In a real application, you would fetch the node data from an API
    // Here we're using the node data directly from the node object
    const nodeData = node.data;
    
    // Close other panel first if open to avoid multiple animations running
    if (edgeOpenRef.current) {
      setSelectedEdge(null);
      setIsEdgePanelOpen(false);
      edgeOpenRef.current = false;
    }
    
    // Update node data and panel state
    setSelectedNode(nodeData);
    setIsNodePanelOpen(true);
    nodeOpenRef.current = true;
  }, [selectedNode?.id]);

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: any) => {
    // Skip work if clicking the same edge when already open
    if (edgeOpenRef.current && selectedEdge?.id === edge.id) return;
    
    // In a real application, you would fetch the edge data from an API
    // Here we're using the edge data directly from the edge object
    const edgeData = edge.data;
    
    // Close other panel first if open to avoid multiple animations running
    if (nodeOpenRef.current) {
      setSelectedNode(null);
      setIsNodePanelOpen(false);
      nodeOpenRef.current = false;
    }
    
    // Update edge data and panel state
    setSelectedEdge(edgeData);
    setIsEdgePanelOpen(true);
    edgeOpenRef.current = true;
  }, [selectedEdge?.id]);

  const handleCloseNodePanel = useCallback(() => {
    setIsNodePanelOpen(false);
    nodeOpenRef.current = false;
    // Clear node data after animation completes
    setTimeout(() => {
      setSelectedNode(null);
    }, 300);
  }, []);

  const handleCloseEdgePanel = useCallback(() => {
    setIsEdgePanelOpen(false);
    edgeOpenRef.current = false;
    // Clear edge data after animation completes
    setTimeout(() => {
      setSelectedEdge(null);
    }, 300);
  }, []);

  const resetPanels = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsNodePanelOpen(false);
    setIsEdgePanelOpen(false);
    nodeOpenRef.current = false;
    edgeOpenRef.current = false;
  }, []);

  return {
    selectedNode,
    selectedEdge,
    isNodePanelOpen,
    isEdgePanelOpen,
    handleNodeClick,
    handleEdgeClick,
    handleCloseNodePanel,
    handleCloseEdgePanel,
    resetPanels
  };
}
