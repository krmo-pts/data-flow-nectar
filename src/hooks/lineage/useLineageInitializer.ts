
import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { useLineageLayout } from './useLineageLayout';

/**
 * Hook for initializing lineage data
 */
export function useLineageInitializer(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  reactFlowInstance: any
) {
  const { applyLayout } = useLineageLayout(setNodes, setEdges, reactFlowInstance);
  
  /**
   * Initialize or reset the layout
   */
  const initialLayout = useCallback((
    datasetSize: 'small' | 'large' | 'veryLarge',
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    getDatasetBySize: () => any
  ) => {
    setIsLoading(true);
    
    // Use setTimeout to allow the UI to update with the loading state
    setTimeout(() => {
      const dataToUse = getDatasetBySize();
      applyLayout(dataToUse, datasetSize, setIsLoading);
    }, datasetSize === 'small' ? 100 : datasetSize === 'large' ? 200 : 300);
  }, [applyLayout]);

  return { initialLayout };
}
