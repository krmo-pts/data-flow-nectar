
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';
import { createTracingMaps } from './dependencyTracing';

/**
 * Prepares data for lineage processing
 */
export const prepareLineageProcessing = (
  nodes: Node[],
  edges: Edge[]
) => {
  // Extract node and edge data
  const nodesData = nodes.map(node => node.data as NodeData);
  const edgesData = edges.map(edge => ({ 
    ...edge.data, 
    source: edge.source, 
    target: edge.target,
    id: edge.id
  }));
  
  // Create tracing maps for efficient traversal
  const { nodeMap, incomingEdgesMap, outgoingEdgesMap } = createTracingMaps(nodesData, edgesData);
  
  // Initialize tracking sets
  const affectedNodeIds = new Set<string>();
  const affectedEdgeIds = new Set<string>();
  
  return {
    nodesData,
    edgesData,
    nodeMap,
    incomingEdgesMap,
    outgoingEdgesMap,
    affectedNodeIds,
    affectedEdgeIds
  };
};

/**
 * Applies lineage changes to nodes and edges
 */
export const applyLineageChanges = (
  affectedNodeIds: Set<string>,
  affectedEdgeIds: Set<string>,
  shouldHide: boolean,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Update edges visibility
  setEdges(edges => {
    return edges.map(edge => {
      const edgeKey = `${edge.source}->${edge.target}`;
      if (affectedEdgeIds.has(edgeKey)) {
        return {
          ...edge,
          hidden: shouldHide
        };
      }
      return edge;
    });
  });
  
  // Update nodes visibility, but preserve focus nodes
  setNodes(nodes => {
    return nodes.map(node => {
      // Never hide focus nodes
      if (node.data?.isFocus) {
        return node;
      }
      
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

/**
 * Processes lineage changes in chunks for large graphs
 */
export const processLineageInChunks = (
  nodeIds: string[],
  edgeIds: string[],
  shouldHide: boolean,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  setIsProcessingLineage: React.Dispatch<React.SetStateAction<boolean>>,
  chunkSize: number = 50
) => {
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
    applyLineageChanges(nodeChunk, edgeChunk, shouldHide, setNodes, setEdges);
    
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
