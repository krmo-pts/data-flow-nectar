
import { useState, useCallback, useRef } from 'react';
import { NodeData } from '@/types/lineage';
import { closePanelWithAnimation, shouldSkipSelection } from '@/utils/lineage/panelUtils';

export function useNodePanel() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  
  // Use ref to track if panel is already open to prevent unnecessary re-renders
  const nodeOpenRef = useRef(false);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    // Skip work if clicking the same node when already open
    if (shouldSkipSelection(selectedNode?.id, node.id, nodeOpenRef)) return;
    
    // In a real application, you would fetch the node data from an API
    // Here we're using the node data directly from the node object
    const nodeData = node.data;
    
    // Update node data and panel state
    setSelectedNode(nodeData);
    setIsNodePanelOpen(true);
    nodeOpenRef.current = true;
  }, [selectedNode?.id]);

  const handleCloseNodePanel = useCallback(() => {
    closePanelWithAnimation(setIsNodePanelOpen, setSelectedNode);
    nodeOpenRef.current = false;
  }, []);

  const resetNodePanel = useCallback(() => {
    setSelectedNode(null);
    setIsNodePanelOpen(false);
    nodeOpenRef.current = false;
  }, []);

  return {
    selectedNode,
    isNodePanelOpen,
    nodeOpenRef,
    handleNodeClick,
    handleCloseNodePanel,
    resetNodePanel,
    setSelectedNode,
    setIsNodePanelOpen
  };
}
