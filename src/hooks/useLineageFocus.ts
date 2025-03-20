
import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';
import { traceUpstreamDependencies, traceDownstreamDependencies } from '@/utils/lineage/dependencyTracing';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for handling focus node functionality in the lineage graph
 */
export function useLineageFocus(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  reactFlowInstance: any
) {
  const { toast } = useToast();

  /**
   * Sets focus on a specific node and analyzes its dependencies
   */
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
  }, [setNodes, setEdges, reactFlowInstance, toast]);

  return { setFocusNode };
}
