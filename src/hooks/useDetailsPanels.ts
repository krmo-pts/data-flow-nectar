
import { useState, useCallback } from 'react';
import { NodeData, EdgeData } from '@/types/lineage';

export function useDetailsPanels() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<EdgeData | null>(null);
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isEdgePanelOpen, setIsEdgePanelOpen] = useState(false);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    // In a real application, you would fetch the node data from an API
    // Here we're using the node data directly from the node object
    const nodeData = node.data;
    setSelectedNode(nodeData);
    setSelectedEdge(null);
    setIsNodePanelOpen(true);
    setIsEdgePanelOpen(false);
  }, []);

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: any) => {
    // In a real application, you would fetch the edge data from an API
    // Here we're using the edge data directly from the edge object
    const edgeData = edge.data;
    setSelectedEdge(edgeData);
    setSelectedNode(null);
    setIsNodePanelOpen(false);
    setIsEdgePanelOpen(true);
  }, []);

  const handleCloseNodePanel = useCallback(() => {
    setIsNodePanelOpen(false);
  }, []);

  const handleCloseEdgePanel = useCallback(() => {
    setIsEdgePanelOpen(false);
  }, []);

  const resetPanels = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsNodePanelOpen(false);
    setIsEdgePanelOpen(false);
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
