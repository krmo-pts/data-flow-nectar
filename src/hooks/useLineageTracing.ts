
import { useCallback, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useToast } from '@/hooks/use-toast';
import { createTracingMaps, traceLineageDependencies } from '@/utils/lineage/dependencyTracing';
import { NodeData } from '@/types/lineage';

interface UseLineageTracingProps {
  nodeId: string;
}

export const useLineageTracing = ({ nodeId }: UseLineageTracingProps) => {
  const [isProcessingLineage, setIsProcessingLineage] = useState(false);
  const { setEdges, setNodes, getNodes, getEdges } = useReactFlow();
  const { toast } = useToast();

  // Optimized function to trace and toggle nodes with chunking for large graphs
  const traceAndToggleNodes = useCallback((
    direction: 'incoming' | 'outgoing', 
    shouldHide: boolean
  ) => {
    setIsProcessingLineage(true);
    
    // Get all edges and nodes
    const edges = getEdges();
    const nodes = getNodes();
    
    // For extremely large graphs, implement chunking
    const isLargeGraph = edges.length > 300 || nodes.length > 150;
    
    // Start processing
    const processLineage = () => {
      // Create tracing maps for efficient traversal
      const nodesData = nodes.map(node => node.data as NodeData);
      const edgesData = edges.map(edge => ({ 
        ...edge.data, 
        source: edge.source, 
        target: edge.target,
        id: edge.id
      }));
      
      const { nodeMap, incomingEdgesMap, outgoingEdgesMap } = createTracingMaps(nodesData, edgesData);
      
      // Initialize tracking sets
      const visited = new Set<string>();
      const affectedNodeIds = new Set<string>();
      const affectedEdgeIds = new Set<string>();
      
      // Use the new tracing function to find all affected nodes and edges
      traceLineageDependencies(
        nodeId,
        direction,
        nodeMap,
        incomingEdgesMap,
        outgoingEdgesMap,
        visited,
        10, // Max depth to prevent infinite recursion
        0,  // Initial depth
        affectedNodeIds,
        affectedEdgeIds
      );
      
      // If it's a large graph, process in chunks
      if (isLargeGraph && affectedNodeIds.size > 50) {
        // Show a toast for large graphs
        toast({
          title: shouldHide ? "Hiding lineage..." : "Showing lineage...",
          description: `Processing ${direction === 'incoming' ? 'upstream' : 'downstream'} connections in batches (${affectedNodeIds.size} nodes).`
        });
        
        // Apply changes in chunks
        applyChangesInChunks(Array.from(affectedNodeIds), Array.from(affectedEdgeIds));
      } else {
        // Apply changes directly for smaller graphs
        applyChanges(affectedNodeIds, affectedEdgeIds);
        setIsProcessingLineage(false);
      }
    };
    
    // Apply changes to nodes and edges
    const applyChanges = (affectedNodeIds: Set<string>, affectedEdgeIds: Set<string>) => {
      // Update edges visibility
      setEdges(edges => {
        return edges.map(edge => {
          const edgeKey = `${edge.source}->${edge.target}`;
          if (affectedEdgeIds.has(edgeKey)) {
            return {
              ...edge,
              hidden: shouldHide
            };
          }
          return edge;
        });
      });
      
      // Update nodes visibility, but preserve focus nodes
      setNodes(nodes => {
        return nodes.map(node => {
          // Never hide focus nodes
          if (node.data?.isFocus) {
            return node;
          }
          
          if (affectedNodeIds.has(node.id)) {
            return {
              ...node,
              hidden: shouldHide
            };
          }
          return node;
        });
      });
    };
    
    // Process changes in chunks for large graphs
    const applyChangesInChunks = (nodeIds: string[], edgeIds: string[], chunkSize: number = 50) => {
      let nodeIndex = 0;
      let edgeIndex = 0;
      
      const processNextChunk = () => {
        // Process a chunk of nodes
        const nodeChunk = new Set(nodeIds.slice(nodeIndex, nodeIndex + chunkSize));
        nodeIndex += chunkSize;
        
        // Process a chunk of edges
        const edgeChunk = new Set(edgeIds.slice(edgeIndex, edgeIndex + chunkSize));
        edgeIndex += chunkSize;
        
        // Apply the current chunk
        applyChanges(nodeChunk, edgeChunk);
        
        // If there are more items to process, schedule the next chunk
        if (nodeIndex < nodeIds.length || edgeIndex < edgeIds.length) {
          setTimeout(processNextChunk, 10);
        } else {
          setIsProcessingLineage(false);
        }
      };
      
      // Start processing
      processNextChunk();
    };
    
    // Start the lineage tracing
    processLineage();
    
  }, [getEdges, getNodes, nodeId, setEdges, setNodes, toast]);

  return {
    isProcessingLineage,
    traceAndToggleNodes
  };
};
