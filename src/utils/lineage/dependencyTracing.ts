
import { NodeData, EdgeData, ImpactType } from '@/types/lineage';

/**
 * Recursively traces upstream dependencies for a node
 */
export const traceUpstreamDependencies = (
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
};

/**
 * Recursively traces downstream dependencies for a node
 */
export const traceDownstreamDependencies = (
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
};
