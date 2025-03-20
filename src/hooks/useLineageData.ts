
import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData, ImpactType } from '@/types/lineage';
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

  // Helper function to trace upstream dependencies (recursively)
  const traceUpstreamDependencies = useCallback((
    nodeId: string,
    nodeMap: Map<string, NodeData>,
    incomingEdgesMap: Map<string, string[]>,
    outgoingEdgesMap: Map<string, string[]>,
    edgesMap: Map<string, EdgeData>,
    distance: number = 1,
    visited: Set<string> = new Set()
  ): string[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    
    const upstreamNodeIds = incomingEdgesMap.get(nodeId) || [];
    let allUpstream: string[] = [...upstreamNodeIds];
    
    for (const upstreamId of upstreamNodeIds) {
      // Mark the upstream node and edge as part of the impact analysis
      if (nodeMap.has(upstreamId)) {
        const upstreamNode = nodeMap.get(upstreamId)!;
        upstreamNode.impactType = 'upstream';
        upstreamNode.impactDistance = distance;
      }
      
      // Mark the connecting edge
      const edgeKey = `${upstreamId}->${nodeId}`;
      if (edgesMap.has(edgeKey)) {
        const edge = edgesMap.get(edgeKey)!;
        edge.isImpactPath = true;
      }
      
      // Recursively trace further upstream
      const furtherUpstream = traceUpstreamDependencies(
        upstreamId, 
        nodeMap, 
        incomingEdgesMap, 
        outgoingEdgesMap, 
        edgesMap, 
        distance + 1,
        visited
      );
      allUpstream = [...allUpstream, ...furtherUpstream];
    }
    
    return allUpstream;
  }, []);

  // Helper function to trace downstream dependencies (recursively)
  const traceDownstreamDependencies = useCallback((
    nodeId: string,
    nodeMap: Map<string, NodeData>,
    incomingEdgesMap: Map<string, string[]>,
    outgoingEdgesMap: Map<string, string[]>,
    edgesMap: Map<string, EdgeData>,
    distance: number = 1,
    visited: Set<string> = new Set()
  ): string[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    
    const downstreamNodeIds = outgoingEdgesMap.get(nodeId) || [];
    let allDownstream: string[] = [...downstreamNodeIds];
    
    for (const downstreamId of downstreamNodeIds) {
      // Mark the downstream node and edge as part of the impact analysis
      if (nodeMap.has(downstreamId)) {
        const downstreamNode = nodeMap.get(downstreamId)!;
        downstreamNode.impactType = 'downstream';
        downstreamNode.impactDistance = distance;
      }
      
      // Mark the connecting edge
      const edgeKey = `${nodeId}->${downstreamId}`;
      if (edgesMap.has(edgeKey)) {
        const edge = edgesMap.get(edgeKey)!;
        edge.isImpactPath = true;
      }
      
      // Recursively trace further downstream
      const furtherDownstream = traceDownstreamDependencies(
        downstreamId, 
        nodeMap, 
        incomingEdgesMap, 
        outgoingEdgesMap, 
        edgesMap, 
        distance + 1,
        visited
      );
      allDownstream = [...allDownstream, ...furtherDownstream];
    }
    
    return allDownstream;
  }, []);

  // Enhanced function to set focus on a node with dependency analysis
  const setFocusNode = useCallback((nodeId: string) => {
    setNodes(prevNodes => {
      // Create maps for quick lookup
      const nodeMap = new Map<string, NodeData>();
      const incomingEdgesMap = new Map<string, string[]>();
      const outgoingEdgesMap = new Map<string, string[]>();
      
      // Reset all previous impact analysis data
      prevNodes.forEach(node => {
        const nodeData = { ...node.data };
        nodeData.isFocus = false;
        nodeData.impactType = 'none';
        nodeData.impactDistance = undefined;
        nodeMap.set(node.id, nodeData);
        incomingEdgesMap.set(node.id, []);
        outgoingEdgesMap.set(node.id, []);
      });
      
      // Create edge map for dependency tracing
      const edgesMap = new Map<string, EdgeData>();
      setEdges(prevEdges => {
        const newEdges = prevEdges.map(edge => {
          const edgeData = { ...edge.data, isImpactPath: false };
          const edgeKey = `${edge.source}->${edge.target}`;
          edgesMap.set(edgeKey, edgeData);
          
          // Update our edge connection maps
          if (incomingEdgesMap.has(edge.target)) {
            incomingEdgesMap.get(edge.target)?.push(edge.source);
          }
          
          if (outgoingEdgesMap.has(edge.source)) {
            outgoingEdgesMap.get(edge.source)?.push(edge.target);
          }
          
          return {
            ...edge,
            data: edgeData,
            animated: false,
            style: { ...edge.style, strokeWidth: 1.5, opacity: 0.5 }
          };
        });
        return newEdges;
      });

      // Mark the focus node
      if (nodeMap.has(nodeId)) {
        const focusNodeData = nodeMap.get(nodeId)!;
        focusNodeData.isFocus = true;
        focusNodeData.impactType = 'direct';
        focusNodeData.impactDistance = 0;
        
        // Trace all upstream and downstream dependencies
        traceUpstreamDependencies(nodeId, nodeMap, incomingEdgesMap, outgoingEdgesMap, edgesMap);
        traceDownstreamDependencies(nodeId, nodeMap, incomingEdgesMap, outgoingEdgesMap, edgesMap);
      }
      
      // Update edges with impact path information
      setEdges(prevEdges => {
        return prevEdges.map(edge => {
          const edgeKey = `${edge.source}->${edge.target}`;
          const edgeData = edgesMap.get(edgeKey);
          
          if (edgeData?.isImpactPath) {
            return {
              ...edge,
              data: edgeData,
              animated: true,
              style: { 
                ...edge.style, 
                strokeWidth: 2, 
                opacity: 1,
                stroke: nodeMap.get(edge.source)?.impactType === 'upstream' ? '#3b82f6' : '#ef4444'
              }
            };
          }
          
          return edge;
        });
      });
      
      // Zoom to the focused node (after a short delay to let rendering finish)
      setTimeout(() => {
        const focusNode = prevNodes.find(node => node.id === nodeId);
        if (focusNode) {
          reactFlowInstance.setCenter(focusNode.position.x, focusNode.position.y, { duration: 800, zoom: 1.5 });
        }
      }, 50);
      
      // Return updated nodes with dependency analysis
      return prevNodes.map(node => {
        const nodeData = nodeMap.get(node.id);
        if (!nodeData) return node;
        
        // Apply styling based on impact relationship
        let nodeClassName = `node-${nodeData.type}`;
        
        if (nodeData.isFocus) {
          nodeClassName += ' focus-node';
        } else if (nodeData.impactType === 'upstream') {
          nodeClassName += ' upstream-node';
        } else if (nodeData.impactType === 'downstream') {
          nodeClassName += ' downstream-node';
        }
        
        return {
          ...node,
          data: nodeData,
          className: nodeClassName
        };
      });
    });
    
    // Notify user
    toast({
      title: 'Impact Analysis',
      description: `Analyzing dependencies for node ${nodeId}`,
    });
  }, [setNodes, reactFlowInstance, toast, traceUpstreamDependencies, traceDownstreamDependencies]);

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
