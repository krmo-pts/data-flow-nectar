
import { NodeData } from '@/types/lineage';

/**
 * Traces lineage dependencies recursively for toggling visibility
 * Ensures focus nodes remain visible
 */
export const traceLineageDependencies = (
  startNodeId: string,
  direction: 'incoming' | 'outgoing',
  nodeMap: Map<string, NodeData>,
  incomingEdgesMap: Map<string, string[]>,
  outgoingEdgesMap: Map<string, string[]>,
  visited: Set<string> = new Set(),
  maxDepth: number = 10,
  depth: number = 0,
  affectedNodeIds: Set<string> = new Set(),
  affectedEdgeIds: Set<string> = new Set(),
) => {
  // Stop if we've already visited this node or reached max depth
  if (visited.has(startNodeId) || depth > maxDepth) return;
  
  // Mark this node as visited
  visited.add(startNodeId);
  
  // Get connections based on direction
  const connections = direction === 'incoming' 
    ? incomingEdgesMap.get(startNodeId) || []
    : outgoingEdgesMap.get(startNodeId) || [];
  
  // Process each connected node
  for (const connectedNodeId of connections) {
    // Skip focus nodes to ensure they remain visible
    if (nodeMap.get(connectedNodeId)?.isFocus) continue;
    
    // Add to affected nodes
    affectedNodeIds.add(connectedNodeId);
    
    // Add edge to affected edges
    const edgeId = direction === 'incoming'
      ? `${connectedNodeId}->${startNodeId}` 
      : `${startNodeId}->${connectedNodeId}`;
    
    affectedEdgeIds.add(edgeId);
    
    // Continue tracing recursively
    traceLineageDependencies(
      connectedNodeId,
      direction,
      nodeMap,
      incomingEdgesMap,
      outgoingEdgesMap,
      visited,
      maxDepth,
      depth + 1,
      affectedNodeIds,
      affectedEdgeIds
    );
  }
  
  return { affectedNodeIds, affectedEdgeIds };
};
