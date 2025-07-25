
import { NodeData, EdgeData } from '@/types/lineage';

/**
 * Recursively traces upstream dependencies for a node
 * with performance optimizations for large graphs
 */
export const traceUpstreamDependencies = (
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
  
  const upstreamNodeIds = incomingEdgesMap.get(nodeId) || [];
  let allUpstream: string[] = [...upstreamNodeIds];
  
  // For very large graphs, limit the number of upstream dependencies we trace
  const nodesToProcess = upstreamNodeIds.length > 50 
    ? upstreamNodeIds.slice(0, 50) // Only process the first 50 upstream nodes
    : upstreamNodeIds;
  
  for (const upstreamId of nodesToProcess) {
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
    
    // Recursively trace further upstream, but only if we haven't hit the depth limit
    if (distance < maxDepth) {
      const furtherUpstream = traceUpstreamDependencies(
        upstreamId, 
        nodeMap, 
        incomingEdgesMap, 
        outgoingEdgesMap, 
        edgesMap, 
        distance + 1,
        visited,
        maxDepth
      );
      allUpstream = [...allUpstream, ...furtherUpstream];
    }
  }
  
  return allUpstream;
};
