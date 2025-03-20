
import { NodeData, EdgeData } from '@/types/lineage';

/**
 * Recursively traces downstream dependencies for a node
 * with performance optimizations for large graphs
 */
export const traceDownstreamDependencies = (
  nodeId: string,
  nodeMap: Map<string, NodeData>,
  incomingEdgesMap: Map<string, string[]>,
  outgoingEdgesMap: Map<string, string[]>,
  edgesMap: Map<string, EdgeData>,
  distance: number = 1,
  visited: Set<string> = new Set(),
  maxDepth: number = 5
): string[] => {
  // Stop tracing if we've already visited this node or reached max depth
  if (visited.has(nodeId) || distance > maxDepth) return [];
  visited.add(nodeId);
  
  const downstreamNodeIds = outgoingEdgesMap.get(nodeId) || [];
  let allDownstream: string[] = [...downstreamNodeIds];
  
  // For very large graphs, limit the number of downstream dependencies we trace
  const nodesToProcess = downstreamNodeIds.length > 50 
    ? downstreamNodeIds.slice(0, 50) // Only process the first 50 downstream nodes
    : downstreamNodeIds;
  
  for (const downstreamId of nodesToProcess) {
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
    
    // Recursively trace further downstream, but only if we haven't hit the depth limit
    if (distance < maxDepth) {
      const furtherDownstream = traceDownstreamDependencies(
        downstreamId, 
        nodeMap, 
        incomingEdgesMap, 
        outgoingEdgesMap, 
        edgesMap, 
        distance + 1,
        visited,
        maxDepth
      );
      allDownstream = [...allDownstream, ...furtherDownstream];
    }
  }
  
  return allDownstream;
};
