
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

  // New function to set a focus node
  const setFocusNode = useCallback((nodeId: string) => {
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        // First, clear focus from all nodes
        const newData = { ...node.data, isFocus: false };
        
        // Then set focus on the selected node
        if (node.id === nodeId) {
          newData.isFocus = true;
          
          // Zoom to the focused node
          setTimeout(() => {
            reactFlowInstance.setCenter(node.position.x, node.position.y, { duration: 800, zoom: 1.5 });
          }, 50);
        }
        
        return {
          ...node,
          data: newData,
          className: `node-${node.data.type} ${nodeId === node.id ? 'focus-node' : ''}`
        };
      });
    });
    
    // Notify user
    toast({
      title: 'Focus set',
      description: `Focusing on node ${nodeId}`,
    });
  }, [setNodes, reactFlowInstance, toast]);

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
