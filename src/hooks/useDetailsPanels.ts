
import { useCallback } from 'react';
import { useNodePanel } from './useNodePanel';
import { useEdgePanel } from './useEdgePanel';

export function useDetailsPanels() {
  // Use the node panel hook
  const {
    selectedNode,
    isNodePanelOpen,
    nodeOpenRef,
    handleNodeClick,
    handleCloseNodePanel,
    resetNodePanel
  } = useNodePanel();
  
  // Use the edge panel hook
  const {
    selectedEdge,
    isEdgePanelOpen,
    edgeOpenRef,
    handleEdgeClick,
    handleCloseEdgePanel,
    resetEdgePanel
  } = useEdgePanel();

  // Function to handle node clicks that also closes edge panel
  const handleNodeClickWithEdgeClose = useCallback((_: React.MouseEvent, node: any) => {
    // Close edge panel first if open to avoid multiple animations running
    if (edgeOpenRef.current) {
      resetEdgePanel();
    }
    
    // Now handle the node click
    handleNodeClick(_, node);
  }, [edgeOpenRef, resetEdgePanel, handleNodeClick]);

  // Function to handle edge clicks that also closes node panel
  const handleEdgeClickWithNodeClose = useCallback((_: React.MouseEvent, edge: any) => {
    // Close node panel first if open to avoid multiple animations running
    if (nodeOpenRef.current) {
      resetNodePanel();
    }
    
    // Now handle the edge click
    handleEdgeClick(_, edge);
  }, [nodeOpenRef, resetNodePanel, handleEdgeClick]);

  // Reset both panels
  const resetPanels = useCallback(() => {
    resetNodePanel();
    resetEdgePanel();
  }, [resetNodePanel, resetEdgePanel]);

  return {
    selectedNode,
    selectedEdge,
    isNodePanelOpen,
    isEdgePanelOpen,
    handleNodeClick: handleNodeClickWithEdgeClose,
    handleEdgeClick: handleEdgeClickWithNodeClose,
    handleCloseNodePanel,
    handleCloseEdgePanel,
    resetPanels
  };
}
