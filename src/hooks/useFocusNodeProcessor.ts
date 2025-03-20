
import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';
import { traceUpstreamDependencies, traceDownstreamDependencies } from '@/utils/lineage/dependencyTracing';
import { updateEdgesWithImpactPath } from '@/utils/lineage/edgeUpdates';
import { updateNodesWithAnalysisResults, zoomToFocusNode } from '@/utils/lineage/nodeUpdates';
import { type ToastProps } from '@/hooks/toast/types';

/**
 * Hook for processing focus node updates
 */
export function useFocusNodeProcessor(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  reactFlowInstance: any,
  toast: (props: ToastProps) => void
) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const processFocusNode = useCallback((
    nodeId: string,
    prevNodes: Node[],
  ): Node[] => {
    setIsAnalyzing(true);
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
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
        
        // Determine the maximum depth based on graph size
        const totalNodes = prevNodes.length;
        // Adjust max depth based on graph size
        const maxDepth = totalNodes > 500 ? 2 : totalNodes > 200 ? 3 : 5;
        
        // Trace all upstream and downstream dependencies with a depth limit
        traceUpstreamDependencies(nodeId, nodeMap, incomingEdgesMap, outgoingEdgesMap, edgesMap, 1, new Set(), maxDepth);
        traceDownstreamDependencies(nodeId, nodeMap, incomingEdgesMap, outgoingEdgesMap, edgesMap, 1, new Set(), maxDepth);
      }
      
      // Update edges with impact path information - use a setTimeout for large graphs
      if (prevNodes.length > 300) {
        setTimeout(() => {
          updateEdgesWithImpactPath(
            [],  // We don't need the prevEdges here as setEdges will provide them
            edgesMap,
            nodeMap,
            setEdges,
            setIsAnalyzing
          );
        }, 50);
      } else {
        // For smaller graphs, update edges immediately
        updateEdgesWithImpactPath(
          [],  // We don't need the prevEdges here as setEdges will provide them
          edgesMap,
          nodeMap,
          setEdges,
          setIsAnalyzing
        );
      }
      
      // Zoom to the focused node
      zoomToFocusNode(nodeId, prevNodes, reactFlowInstance, prevNodes.length);
      
      // Update nodes with analysis results
      setNodes(updateNodesWithAnalysisResults(prevNodes, nodeMap, nodeId));
    }, 10); // Small delay to allow UI to update
    
    // Return the original nodes for now (they'll be updated via setNodes in the setTimeout)
    return prevNodes;
  }, [reactFlowInstance, setEdges, setIsAnalyzing, setNodes]);

  return {
    processFocusNode,
    isAnalyzing,
    setIsAnalyzing
  };
}
