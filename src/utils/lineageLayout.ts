
import { NodeData, EdgeData } from '@/types/lineage';
import { Node, Edge, MarkerType } from 'reactflow';

export const calculateInitialLayout = (
  nodes: NodeData[],
  edges: EdgeData[]
): { flowNodes: Node[], flowEdges: Edge[] } => {
  // Create a map of node IDs to track dependencies
  const nodeMap = new Map();
  const incomingEdges = new Map();
  const outgoingEdges = new Map();
  
  // Initialize maps
  nodes.forEach(node => {
    nodeMap.set(node.id, node);
    incomingEdges.set(node.id, []);
    outgoingEdges.set(node.id, []);
  });
  
  // Map connections between nodes
  edges.forEach(edge => {
    if (outgoingEdges.has(edge.source)) {
      outgoingEdges.get(edge.source).push(edge.target);
    }
    
    if (incomingEdges.has(edge.target)) {
      incomingEdges.get(edge.target).push(edge.source);
    }
  });
  
  // Calculate node levels based on dependencies
  const nodeLevels = new Map();
  const calculateLevel = (nodeId: string, visited = new Set<string>()): number => {
    // Prevent infinite loops with circular dependencies
    if (visited.has(nodeId)) return 0;
    
    visited.add(nodeId);
    
    // If node has no incoming edges, it's a source node (level 0)
    const incoming = incomingEdges.get(nodeId) || [];
    if (incoming.length === 0) return 0;
    
    // Node level is 1 + max level of all its dependencies
    let maxLevel = 0;
    for (const sourceId of incoming) {
      const sourceLevel = nodeLevels.has(sourceId) 
        ? nodeLevels.get(sourceId) 
        : calculateLevel(sourceId, new Set(visited));
      maxLevel = Math.max(maxLevel, sourceLevel);
    }
    
    return maxLevel + 1;
  };
  
  // Calculate levels for all nodes
  nodes.forEach(node => {
    if (!nodeLevels.has(node.id)) {
      nodeLevels.set(node.id, calculateLevel(node.id));
    }
  });
  
  // Group nodes by their level
  const nodesByLevel = new Map();
  nodeLevels.forEach((level, nodeId) => {
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level).push(nodeId);
  });
  
  // Sort nodes within each level to minimize edge crossings
  const sortedLevels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
  
  // Improved layout configuration
  const levelWidth = 350; // Increased horizontal spacing between levels
  const nodeHeight = 150; // Increased estimated node height
  const nodeWidth = 250; // Estimated node width
  const nodePaddingY = 80; // Vertical padding between nodes
  
  // Position nodes based on their level and order
  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  sortedLevels.forEach((level) => {
    const nodesInLevel = nodesByLevel.get(level) || [];
    const levelHeight = nodesInLevel.length * (nodeHeight + nodePaddingY) - nodePaddingY;
    const startY = -levelHeight / 2; // Center vertically
    
    nodesInLevel.forEach((nodeId, index) => {
      nodePositions[nodeId] = {
        x: level * levelWidth,
        y: startY + index * (nodeHeight + nodePaddingY),
      };
    });
  });
  
  // Create React Flow nodes with positioned data
  const flowNodes = nodes.map((node) => {
    const position = nodePositions[node.id] || { x: Math.random() * 500, y: Math.random() * 500 };
    
    return {
      id: node.id,
      type: 'default',
      position,
      data: { ...node },
      className: `node-${node.type}`,
    };
  });
  
  // Create edges with marker end and data
  const flowEdges = edges.map((edge) => {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: edge,
      type: 'default',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: '#64748b',
      },
    };
  });

  return { flowNodes, flowEdges };
};
