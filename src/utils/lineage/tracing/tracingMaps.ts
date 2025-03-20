
import { NodeData, EdgeData } from '@/types/lineage';

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
