
import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';
import { mockLineageData } from '@/data/mockLineageData';
import { mockLargeLineageData } from '@/data/mockLargeLineageData';
import { calculateInitialLayout } from '@/utils/lineageLayout';
import { useReactFlow } from 'reactflow';
import { useToast } from '@/hooks/use-toast';

export function useLineageData() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [useLargeDataset, setUseLargeDataset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const reactFlowInstance = useReactFlow();
  const { toast } = useToast();

  const initialLayout = useCallback(() => {
    setIsLoading(true);
    
    // Use setTimeout to allow the UI to update with the loading state
    setTimeout(() => {
      try {
        const dataToUse = useLargeDataset ? mockLargeLineageData : mockLineageData;
        console.log(`Loading ${dataToUse.nodes.length} nodes and ${dataToUse.edges.length} edges`);
        
        const { flowNodes, flowEdges } = calculateInitialLayout(
          dataToUse.nodes,
          dataToUse.edges
        );
        
        setNodes(flowNodes);
        setEdges(flowEdges);
        
        // Give more time for the layout to stabilize before fitting view
        // Increase timeout for large dataset
        const timeoutDuration = useLargeDataset ? 1000 : 300;
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
    }, useLargeDataset ? 200 : 100); // Increased timeout for large dataset initialization
  }, [reactFlowInstance, useLargeDataset, toast]);

  useEffect(() => {
    initialLayout();
  }, [initialLayout, useLargeDataset]);

  const toggleDataset = useCallback(() => {
    if (!isLoading) {
      setUseLargeDataset(prev => !prev);
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
    useLargeDataset,
    isLoading,
    toggleDataset,
    resetView
  };
}
