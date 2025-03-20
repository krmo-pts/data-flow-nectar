
import { useCallback, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useToast } from '@/hooks/use-toast';
import { createTracingMaps, traceLineageDependencies } from '@/utils/lineage/dependencyTracing';
import { 
  prepareLineageProcessing, 
  applyLineageChanges,
  processLineageInChunks
} from '@/utils/lineage/lineageProcessing';
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
    
    // Prepare data for lineage processing
    const { 
      nodesData, 
      edgesData, 
      nodeMap, 
      incomingEdgesMap, 
      outgoingEdgesMap,
      affectedNodeIds,
      affectedEdgeIds
    } = prepareLineageProcessing(nodes, edges);
    
    // Trace lineage dependencies
    traceLineageDependencies(
      nodeId,
      direction,
      nodeMap,
      incomingEdgesMap,
      outgoingEdgesMap,
      new Set<string>(),  // visited
      10,                 // Max depth
      0,                  // Initial depth
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
      processLineageInChunks(
        Array.from(affectedNodeIds), 
        Array.from(affectedEdgeIds), 
        shouldHide,
        setNodes,
        setEdges,
        setIsProcessingLineage
      );
    } else {
      // Apply changes directly for smaller graphs
      applyLineageChanges(
        affectedNodeIds, 
        affectedEdgeIds, 
        shouldHide,
        setNodes, 
        setEdges
      );
      setIsProcessingLineage(false);
    }
  }, [getEdges, getNodes, nodeId, setEdges, setNodes, toast]);

  return {
    isProcessingLineage,
    traceAndToggleNodes
  };
};
