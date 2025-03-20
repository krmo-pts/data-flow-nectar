
import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useReactFlow } from 'reactflow';
import { calculateInitialLayout } from '@/utils/lineageLayout';
import { useToast } from '@/hooks/use-toast';
import { useLineageDataset } from './useLineageDataset';
import { useLineageFocus } from './useLineageFocus';

/**
 * Main hook for lineage data management
 */
export function useLineageData() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowInstance = useReactFlow();
  const { toast } = useToast();
  
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

  /**
   * Initialize or reset the layout
   */
  const initialLayout = useCallback(() => {
    setIsLoading(true);
    
    // Use setTimeout to allow the UI to update with the loading state
    setTimeout(() => {
      try {
        const dataToUse = getDatasetBySize();
        
        console.log(`Loading ${dataToUse.nodes.length} nodes and ${dataToUse.edges.length} edges`);
        
        // For very large datasets, apply chunked processing to avoid UI freeze
        if (datasetSize === 'veryLarge') {
          // First just load nodes with simplified layout for immediate display
          setNodes(dataToUse.nodes.map((node, index) => ({
            id: node.id,
            type: 'default',
            position: { x: (index % 20) * 300, y: Math.floor(index / 20) * 200 },
            data: { ...node },
            className: `node-${node.type}`,
          })));
          
          // Then batch process the full layout calculation
          setTimeout(() => {
            const { flowNodes, flowEdges } = calculateInitialLayout(
              dataToUse.nodes,
              dataToUse.edges
            );
            
            setNodes(flowNodes);
            setEdges(flowEdges);
            
            setTimeout(() => {
              reactFlowInstance.fitView({ padding: 0.4, includeHiddenNodes: false });
              setIsLoading(false);
            }, 500);
          }, 100);
        } else {
          // For small/large datasets, calculate layout all at once
          const { flowNodes, flowEdges } = calculateInitialLayout(
            dataToUse.nodes,
            dataToUse.edges
          );
          
          setNodes(flowNodes);
          setEdges(flowEdges);
          
          // Give more time for the layout to stabilize before fitting view
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.4, includeHiddenNodes: false });
            setIsLoading(false);
          }, datasetSize === 'small' ? 300 : 500);
        }
      } catch (error) {
        console.error('Error loading lineage data:', error);
        toast({
          title: 'Error loading data',
          description: 'There was a problem loading the lineage data. Please try again.',
        });
        setIsLoading(false);
      }
    }, datasetSize === 'small' ? 100 : datasetSize === 'large' ? 200 : 300);
  }, [reactFlowInstance, datasetSize, toast, getDatasetBySize, setIsLoading]);

  // Initialize layout when dataset size changes
  useEffect(() => {
    initialLayout();
  }, [initialLayout, datasetSize]);

  // Reset view function
  const resetView = useCallback(() => {
    initialLayout();
  }, [initialLayout]);

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
