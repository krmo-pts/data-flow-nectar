
import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';
import { mockLineageData } from '@/data/mockLineageData';
import { mockLargeLineageData, mockVeryLargeLineageData } from '@/data/mockLargeLineageData';
import { calculateInitialLayout } from '@/utils/lineageLayout';
import { useReactFlow } from 'reactflow';
import { useToast } from '@/hooks/use-toast';

export function useLineageData() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [datasetSize, setDatasetSize] = useState<'small' | 'large' | 'veryLarge'>('small');
  const [isLoading, setIsLoading] = useState(false);
  const reactFlowInstance = useReactFlow();
  const { toast } = useToast();

  const initialLayout = useCallback(() => {
    setIsLoading(true);
    
    // Use setTimeout to allow the UI to update with the loading state
    setTimeout(() => {
      try {
        let dataToUse;
        switch (datasetSize) {
          case 'large':
            dataToUse = mockLargeLineageData;
            break;
          case 'veryLarge':
            dataToUse = mockVeryLargeLineageData;
            break;
          default:
            dataToUse = mockLineageData;
        }
        
        console.log(`Loading ${dataToUse.nodes.length} nodes and ${dataToUse.edges.length} edges`);
        
        const { flowNodes, flowEdges } = calculateInitialLayout(
          dataToUse.nodes,
          dataToUse.edges
        );
        
        setNodes(flowNodes);
        setEdges(flowEdges);
        
        // Give more time for the layout to stabilize before fitting view
        // Increase timeout for larger datasets
        let timeoutDuration = 300;
        if (datasetSize === 'large') timeoutDuration = 1000;
        if (datasetSize === 'veryLarge') timeoutDuration = 2000;
        
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.4, includeHiddenNodes: false });
          setIsLoading(false);
        }, timeoutDuration);
      } catch (error) {
        console.error('Error loading lineage data:', error);
        toast({
          title: 'Error loading data',
          description: 'There was a problem loading the lineage data. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    }, datasetSize === 'small' ? 100 : datasetSize === 'large' ? 200 : 300);
  }, [reactFlowInstance, datasetSize, toast]);

  useEffect(() => {
    initialLayout();
  }, [initialLayout, datasetSize]);

  const setDatasetSizeHandler = useCallback((size: 'small' | 'large' | 'veryLarge') => {
    if (!isLoading) {
      setDatasetSize(size);
    } else {
      toast({
        title: 'Loading in progress',
        description: 'Please wait for the current dataset to finish loading before switching.',
      });
    }
  }, [isLoading, toast]);

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
    resetView
  };
}
