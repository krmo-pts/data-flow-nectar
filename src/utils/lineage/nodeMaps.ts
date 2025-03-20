
import { NodeData, EdgeData } from '@/types/lineage';
import { NodeMaps } from './types';

/**
 * Creates maps for node relationships to optimize layout and traversal operations
 */
export const createNodeMaps = (
  nodes: NodeData[],
  edges: EdgeData[]
): NodeMaps => {
  // Create maps for efficient lookup
  const nodeMap = new Map<string, NodeData>();
  const incomingEdges = new Map<string, string[]>();
  const outgoingEdges = new Map<string, string[]>();
  
  // Initialize maps
  nodes.forEach(node => {
    nodeMap.set(node.id, {...node});
    incomingEdges.set(node.id, []);
    outgoingEdges.set(node.id, []);
  });
  
  // Map connections between nodes
  edges.forEach(edge => {
    // Add to outgoing map
    const outgoing = outgoingEdges.get(edge.source) || [];
    outgoingEdges.set(edge.source, [...outgoing, edge.target]);
    
    // Add to incoming map
    const incoming = incomingEdges.get(edge.target) || [];
    incomingEdges.set(edge.target, [...incoming, edge.source]);
  });
  
  return { nodeMap, incomingEdges, outgoingEdges };
};
