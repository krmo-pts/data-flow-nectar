
import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useReactFlow } from 'reactflow';
import { useLineageDataset } from './useLineageDataset';
import { useLineageFocus } from './useLineageFocus';
import { useLineageInitializer } from './lineage/useLineageInitializer';

/**
 * Main hook for lineage data management
 */
export function useLineageData() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowInstance = useReactFlow();
  
  // Use the dataset management hook
  const { 
    datasetSize, 
    isLoading, 
    setIsLoading, 
    setDatasetSize: setDatasetSizeHandler,
    getDatasetBySize
  } = useLineageDataset();
  
  // Use the focus node hook
  const { setFocusNode } = useLineageFocus(setNodes, setEdges, reactFlowInstance);

  // Use the initializer hook
  const { initialLayout } = useLineageInitializer(setNodes, setEdges, reactFlowInstance);

  // Initialize layout when dataset size changes
  useEffect(() => {
    const layoutInitializer = () => {
      initialLayout(datasetSize, setIsLoading, getDatasetBySize);
    };
    
    layoutInitializer();
  }, [initialLayout, datasetSize, getDatasetBySize, setIsLoading]);

  // Reset view function
  const resetView = useCallback(() => {
    initialLayout(datasetSize, setIsLoading, getDatasetBySize);
  }, [initialLayout, datasetSize, getDatasetBySize, setIsLoading]);

  return {
    nodes,
    setNodes,
    edges,
    setEdges,
    datasetSize,
    isLoading,
    setDatasetSize: setDatasetSizeHandler,
    resetView,
    setFocusNode
  };
}
