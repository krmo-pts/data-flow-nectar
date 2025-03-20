
import { useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '@/hooks/use-toast';
import { useFocusNodeProcessor } from './useFocusNodeProcessor';
import { showAnalysisStartedToast, showAnalysisInProgressToast } from '@/utils/lineage/focusNotifications';
import { resetImpactAnalysis } from '@/utils/lineage/focusReset';

/**
 * Hook for handling focus node functionality in the lineage graph
 */
export function useLineageFocus(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  reactFlowInstance: any
) {
  const { toast } = useToast();
  const [currentFocusNodeId, setCurrentFocusNodeId] = useState<string | null>(null);
  
  // Use the focus node processor hook
  const { processFocusNode, isAnalyzing, setIsAnalyzing } = useFocusNodeProcessor(
    setNodes,
    setEdges,
    reactFlowInstance,
    toast
  );

  /**
   * Sets or removes focus on a specific node and analyzes its dependencies
   */
  const setFocusNode = useCallback((nodeId: string) => {
    // Check if we're toggling focus off the currently focused node
    if (currentFocusNodeId === nodeId) {
      // Reset all nodes and edges
      resetImpactAnalysis([], setNodes, setEdges, setIsAnalyzing);
      setCurrentFocusNodeId(null);
      return;
    }
    
    // Prevent multiple simultaneous analyses
    if (isAnalyzing) {
      showAnalysisInProgressToast(toast);
      return;
    }
    
    // Show notification that analysis is starting
    showAnalysisStartedToast(toast, nodeId);
    
    // Process the focus node and update the state
    setNodes(prevNodes => processFocusNode(nodeId, prevNodes));
    
    // Track the currently focused node
    setCurrentFocusNodeId(nodeId);
    
  }, [currentFocusNodeId, isAnalyzing, processFocusNode, setEdges, setIsAnalyzing, setNodes, toast]);

  return { setFocusNode, isAnalyzing, currentFocusNodeId };
}
