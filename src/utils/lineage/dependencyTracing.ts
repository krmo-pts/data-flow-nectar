
import { NodeData, EdgeData, ImpactType } from '@/types/lineage';

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

/**
 * Creates maps for nodes and edges to optimize tracing operations
 */
export const createTracingMaps = (nodes: NodeData[], edges: EdgeData[]) => {
  // Create maps for efficient lookup
  const nodeMap = new Map<string, NodeData>();
  const incomingEdgesMap = new Map<string, string[]>();
  const outgoingEdgesMap = new Map<string, string[]>();
  const edgesMap = new Map<string, EdgeData>();
  
  // Initialize maps
  nodes.forEach(node => {
    nodeMap.set(node.id, {...node});
    incomingEdgesMap.set(node.id, []);
    outgoingEdgesMap.set(node.id, []);
  });
  
  // Fill maps with connections
  edges.forEach(edge => {
    const edgeKey = `${edge.source}->${edge.target}`;
    edgesMap.set(edgeKey, {...edge});
    
    // Add to outgoing map
    const outgoing = outgoingEdgesMap.get(edge.source) || [];
    outgoingEdgesMap.set(edge.source, [...outgoing, edge.target]);
    
    // Add to incoming map
    const incoming = incomingEdgesMap.get(edge.target) || [];
    incomingEdgesMap.set(edge.target, [...incoming, edge.source]);
  });
  
  return { nodeMap, incomingEdgesMap, outgoingEdgesMap, edgesMap };
};

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
