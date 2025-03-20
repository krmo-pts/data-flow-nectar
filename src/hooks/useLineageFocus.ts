
import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '@/hooks/use-toast';
import { useFocusNodeProcessor } from './useFocusNodeProcessor';
import { showAnalysisStartedToast, showAnalysisInProgressToast } from '@/utils/lineage/focusNotifications';

/**
 * Hook for handling focus node functionality in the lineage graph
 */
export function useLineageFocus(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  reactFlowInstance: any
) {
  const { toast } = useToast();
  
  // Use the focus node processor hook
  const { processFocusNode, isAnalyzing, setIsAnalyzing } = useFocusNodeProcessor(
    setNodes,
    setEdges,
    reactFlowInstance,
    toast
  );

  /**
   * Sets focus on a specific node and analyzes its dependencies
   */
  const setFocusNode = useCallback((nodeId: string) => {
    // Prevent multiple simultaneous analyses
    if (isAnalyzing) {
      showAnalysisInProgressToast(toast);
      return;
    }
    
    // Show notification that analysis is starting
    showAnalysisStartedToast(toast, nodeId);
    
    // Process the focus node and update the state
    setNodes(prevNodes => processFocusNode(nodeId, prevNodes));
    
  }, [isAnalyzing, processFocusNode, setNodes, toast]);

  return { setFocusNode, isAnalyzing };
}
