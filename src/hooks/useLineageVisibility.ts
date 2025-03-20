
import { useState, useCallback } from 'react';
import { useLineageTracing } from './useLineageTracing';

interface UseLineageVisibilityProps {
  nodeId: string;
}

export const useLineageVisibility = ({ nodeId }: UseLineageVisibilityProps) => {
  const [hideIncomingLineage, setHideIncomingLineage] = useState(false);
  const [hideOutgoingLineage, setHideOutgoingLineage] = useState(false);
  
  const { isProcessingLineage, traceAndToggleNodes } = useLineageTracing({ nodeId });
  
  // Function to toggle incoming lineage connections
  const toggleIncomingLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    
    // If already processing, don't allow another toggle
    if (isProcessingLineage) return;
    
    setHideIncomingLineage(prev => {
      const shouldHide = !prev;
      traceAndToggleNodes('incoming', shouldHide);
      return shouldHide;
    });
  }, [isProcessingLineage, traceAndToggleNodes]);
  
  // Function to toggle outgoing lineage connections
  const toggleOutgoingLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    
    // If already processing, don't allow another toggle
    if (isProcessingLineage) return;
    
    setHideOutgoingLineage(prev => {
      const shouldHide = !prev;
      traceAndToggleNodes('outgoing', shouldHide);
      return shouldHide;
    });
  }, [isProcessingLineage, traceAndToggleNodes]);
  
  return {
    hideIncomingLineage,
    hideOutgoingLineage,
    toggleIncomingLineage,
    toggleOutgoingLineage,
    isProcessingLineage
  };
};
