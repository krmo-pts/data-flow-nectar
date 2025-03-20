
import { useCallback, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useToast } from '@/hooks/use-toast';

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
    
    // Start with collecting affected node and edge IDs
    const processInitialBatch = () => {
      const visitedNodeIds = new Set<string>([nodeId]);
      const affectedNodeIds = new Set<string>();
      const affectedEdgeIds = new Set<string>();
      const nodesToProcess = new Set<string>();
      
      // Initial batch - find direct connections only
      const connectedEdges = edges.filter(edge => 
        direction === 'incoming' ? edge.target === nodeId : edge.source === nodeId
      );
      
      for (const edge of connectedEdges) {
        affectedEdgeIds.add(edge.id);
        
        // Get the connected node id
        const connectedNodeId = direction === 'incoming' ? edge.source : edge.target;
        affectedNodeIds.add(connectedNodeId);
        
        // Add to queue for further processing if this is a large graph
        if (!visitedNodeIds.has(connectedNodeId)) {
          nodesToProcess.add(connectedNodeId);
        }
      }
      
      // Apply immediate changes for direct connections
      applyChanges(affectedNodeIds, affectedEdgeIds);
      
      // If it's a large graph, continue processing in chunks
      if (isLargeGraph && nodesToProcess.size > 0) {
        // Show a toast for large graphs
        toast({
          title: shouldHide ? "Hiding lineage..." : "Showing lineage...",
          description: `Processing ${direction === 'incoming' ? 'upstream' : 'downstream'} connections in batches.`
        });
        
        // Continue with the rest in chunks
        processInChunks(Array.from(nodesToProcess), visitedNodeIds, new Set(affectedNodeIds), new Set(affectedEdgeIds));
      } else {
        setIsProcessingLineage(false);
      }
    };
    
    // Process remaining nodes in chunks to avoid UI freeze
    const processInChunks = (
      remainingNodes: string[],
      visitedNodeIds: Set<string>,
      affectedNodeIds: Set<string>,
      affectedEdgeIds: Set<string>,
      depth: number = 1,
      maxDepth: number = 5
    ) => {
      // Stop recursion when we reach max depth or have no more nodes
      if (depth > maxDepth || remainingNodes.length === 0) {
        applyChanges(affectedNodeIds, affectedEdgeIds);
        setIsProcessingLineage(false);
        return;
      }
      
      // Process a chunk of nodes (limit to 20 nodes per chunk)
      const chunkSize = 20;
      const currentChunk = remainingNodes.slice(0, chunkSize);
      const newNodesToProcess = new Set<string>();
      
      // Process current chunk
      for (const currentNodeId of currentChunk) {
        if (visitedNodeIds.has(currentNodeId)) continue;
        visitedNodeIds.add(currentNodeId);
        
        const connectedEdges = edges.filter(edge => 
          direction === 'incoming' ? edge.target === currentNodeId : edge.source === currentNodeId
        );
        
        for (const edge of connectedEdges) {
          affectedEdgeIds.add(edge.id);
          
          // Get the connected node id
          const connectedNodeId = direction === 'incoming' ? edge.source : edge.target;
          affectedNodeIds.add(connectedNodeId);
          
          // Queue for next chunk if not already visited
          if (!visitedNodeIds.has(connectedNodeId)) {
            newNodesToProcess.add(connectedNodeId);
          }
        }
      }
      
      // Apply current chunk's changes
      applyChanges(affectedNodeIds, affectedEdgeIds);
      
      // Prepare the next chunk and continue
      const nextRemainingNodes = [
        ...remainingNodes.slice(chunkSize), 
        ...Array.from(newNodesToProcess)
      ];
      
      // Continue with next chunk after a small delay
      if (nextRemainingNodes.length > 0 && depth < maxDepth) {
        setTimeout(() => {
          processInChunks(
            nextRemainingNodes,
            visitedNodeIds,
            affectedNodeIds,
            affectedEdgeIds,
            depth + 1,
            maxDepth
          );
        }, 50);
      } else {
        setIsProcessingLineage(false);
      }
    };
    
    // Apply changes to nodes and edges
    const applyChanges = (affectedNodeIds: Set<string>, affectedEdgeIds: Set<string>) => {
      // Update edges visibility
      setEdges(edges => {
        return edges.map(edge => {
          if (affectedEdgeIds.has(edge.id)) {
            return {
              ...edge,
              hidden: shouldHide
            };
          }
          return edge;
        });
      });
      
      // Update nodes visibility
      setNodes(nodes => {
        return nodes.map(node => {
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
    
    // Start processing
    processInitialBatch();
  }, [getEdges, getNodes, nodeId, setEdges, setNodes, toast]);

  return {
    isProcessingLineage,
    traceAndToggleNodes
  };
};
