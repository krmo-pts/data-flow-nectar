
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
    
    // Build node connection maps for tracing
    const incomingMap = new Map<string, string[]>();
    const outgoingMap = new Map<string, string[]>();
    
    // Initialize maps
    nodes.forEach(node => {
      incomingMap.set(node.id, []);
      outgoingMap.set(node.id, []);
    });
    
    // Fill maps with connections
    edges.forEach(edge => {
      const { source, target } = edge;
      
      // Add to outgoing map
      if (outgoingMap.has(source)) {
        const connections = outgoingMap.get(source) || [];
        outgoingMap.set(source, [...connections, target]);
      }
      
      // Add to incoming map
      if (incomingMap.has(target)) {
        const connections = incomingMap.get(target) || [];
        incomingMap.set(target, [...connections, source]);
      }
    });
    
    // Recursive function to trace dependencies in either direction
    const traceDependencies = (
      currentNodeId: string,
      visitedNodes: Set<string>,
      affectedNodeIds: Set<string>,
      affectedEdgeIds: Set<string>,
      traceDirection: 'incoming' | 'outgoing',
      depth: number = 0,
      maxDepth: number = 15
    ) => {
      // Stop recursion if we've visited this node before or reached max depth
      if (visitedNodes.has(currentNodeId) || depth > maxDepth) return;
      visitedNodes.add(currentNodeId);
      
      // Get connections based on direction
      const connections = traceDirection === 'incoming' 
        ? incomingMap.get(currentNodeId) || []
        : outgoingMap.get(currentNodeId) || [];
      
      for (const connectedNodeId of connections) {
        // Add to affected nodes
        affectedNodeIds.add(connectedNodeId);
        
        // Add edge to affected edges
        const edgeId = traceDirection === 'incoming'
          ? `${connectedNodeId}->${currentNodeId}` // Source to target
          : `${currentNodeId}->${connectedNodeId}`; // Source to target
        
        // Find the actual edge ID from the edges array
        const edge = edges.find(e => 
          (e.source === connectedNodeId && e.target === currentNodeId && traceDirection === 'incoming') ||
          (e.source === currentNodeId && e.target === connectedNodeId && traceDirection === 'outgoing')
        );
        
        if (edge) {
          affectedEdgeIds.add(edge.id);
        }
        
        // Continue tracing recursively
        traceDependencies(
          connectedNodeId,
          visitedNodes,
          affectedNodeIds,
          affectedEdgeIds,
          traceDirection,
          depth + 1,
          maxDepth
        );
      }
    };
    
    // Start processing
    const processLineage = () => {
      const visitedNodeIds = new Set<string>();
      const affectedNodeIds = new Set<string>();
      const affectedEdgeIds = new Set<string>();
      
      // Start tracing from the selected node
      traceDependencies(
        nodeId,
        visitedNodeIds,
        affectedNodeIds,
        affectedEdgeIds,
        direction
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
