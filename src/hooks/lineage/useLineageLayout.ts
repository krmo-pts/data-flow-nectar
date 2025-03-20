
import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { calculateInitialLayout } from '@/utils/lineageLayout';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for handling lineage layout operations
 */
export function useLineageLayout(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  reactFlowInstance: any
) {
  const { toast } = useToast();

  /**
   * Apply layout to the given dataset
   */
  const applyLayout = useCallback((
    dataToUse: any, 
    datasetSize: 'small' | 'large' | 'veryLarge',
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    try {
      console.log(`Loading ${dataToUse.nodes.length} nodes and ${dataToUse.edges.length} edges`);
      
      // For very large datasets, apply chunked processing to avoid UI freeze
      if (datasetSize === 'veryLarge') {
        // First just load nodes with simplified layout for immediate display
        setNodes(dataToUse.nodes.map((node: any, index: number) => ({
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
  }, [reactFlowInstance, setEdges, setNodes, toast]);

  return { applyLayout };
}
