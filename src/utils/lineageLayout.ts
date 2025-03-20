
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
  
  // Improved sorting to minimize edge crossings
  const sortNodesInLevel = (level: number, prevLevelNodes: string[] | null) => {
    const nodesInLevel = nodesByLevel.get(level) || [];
    
    if (!prevLevelNodes || prevLevelNodes.length === 0 || nodesInLevel.length <= 1) {
      return nodesInLevel;
    }
    
    // Calculate average position of connected nodes from previous level
    const nodePositionWeights = new Map<string, number>();
    
    nodesInLevel.forEach(nodeId => {
      const connected = incomingEdges.get(nodeId) || [];
      let sum = 0;
      let count = 0;
      
      connected.forEach(sourceId => {
        const sourceIndex = prevLevelNodes.indexOf(sourceId);
        if (sourceIndex !== -1) {
          sum += sourceIndex;
          count++;
        }
      });
      
      // If node is connected to previous level, assign a weight based on connected nodes' positions
      // If not connected, we'll position it at the end
      if (count > 0) {
        nodePositionWeights.set(nodeId, sum / count);
      } else {
        nodePositionWeights.set(nodeId, prevLevelNodes.length);
      }
    });
    
    // Sort nodes based on their weights (average position of connected nodes)
    return [...nodesInLevel].sort((a, b) => {
      const weightA = nodePositionWeights.get(a) || 0;
      const weightB = nodePositionWeights.get(b) || 0;
      return weightA - weightB;
    });
  };
  
  // Sort nodes within each level to minimize edge crossings
  const sortedLevels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
  const sortedNodesByLevel = new Map();
  
  // For each level, sort nodes based on connections to previous level
  let prevLevelNodes = null;
  for (const level of sortedLevels) {
    const sortedNodes = sortNodesInLevel(level, prevLevelNodes);
    sortedNodesByLevel.set(level, sortedNodes);
    prevLevelNodes = sortedNodes;
  }
  
  // Improved layout configuration with more spacing
  const levelWidth = 400; // Increased horizontal spacing between levels
  const nodeHeight = 150; // Estimated node height
  const nodeWidth = 250; // Estimated node width
  const nodePaddingY = 100; // Increased vertical padding between nodes
  
  // Position nodes based on their level and order
  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  sortedLevels.forEach((level) => {
    const nodesInLevel = sortedNodesByLevel.get(level) || [];
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
