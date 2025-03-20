
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
  
  // First pass: Order nodes within each level to minimize crossings
  sortedLevels.forEach((level, levelIndex) => {
    if (levelIndex === 0) return; // No need to sort the first level
    
    const nodesInLevel = nodesByLevel.get(level);
    const prevLevelNodes = nodesByLevel.get(sortedLevels[levelIndex - 1]);
    
    // Order nodes based on the average position of their parent nodes
    nodesInLevel.sort((nodeIdA, nodeIdB) => {
      const parentsA = incomingEdges.get(nodeIdA) || [];
      const parentsB = incomingEdges.get(nodeIdB) || [];
      
      // Calculate the average index of parent nodes for each node
      const avgParentIndexA = parentsA.length ? 
        parentsA.reduce((sum, parentId) => sum + prevLevelNodes.indexOf(parentId), 0) / parentsA.length : 
        Number.MAX_SAFE_INTEGER;
      
      const avgParentIndexB = parentsB.length ? 
        parentsB.reduce((sum, parentId) => sum + prevLevelNodes.indexOf(parentId), 0) / parentsB.length : 
        Number.MAX_SAFE_INTEGER;
      
      return avgParentIndexA - avgParentIndexB;
    });
  });
  
  // Position nodes based on their level and order
  const levelWidth = 250; // Horizontal spacing between levels
  const nodeHeight = 120; // Estimated node height - Define nodeHeight here at this scope
  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  sortedLevels.forEach((level) => {
    const nodesInLevel = nodesByLevel.get(level) || [];
    const totalHeight = nodesInLevel.length * nodeHeight;
    const startY = -totalHeight / 2; // Center vertically
    
    nodesInLevel.forEach((nodeId, index) => {
      // Use more precise vertical positioning to reduce overlaps
      nodePositions[nodeId] = {
        x: level * levelWidth,
        y: startY + index * nodeHeight,
      };
    });
  });
  
  // Second pass: Apply minimal adjustments to reduce remaining edge crossings
  edges.forEach(edge => {
    const sourcePos = nodePositions[edge.source];
    const targetPos = nodePositions[edge.target];
    
    if (sourcePos && targetPos) {
      // If nodes are at adjacent levels but have a significant y-distance,
      // slightly adjust their positions to reduce the crossing angle
      const sourceLevel = nodeLevels.get(edge.source);
      const targetLevel = nodeLevels.get(edge.target);
      
      if (targetLevel - sourceLevel === 1 && Math.abs(sourcePos.y - targetPos.y) > nodeHeight) {
        // Small adjustment to make edges more horizontal when possible
        const adjustment = 20;
        if (sourcePos.y < targetPos.y) {
          sourcePos.y += adjustment;
          targetPos.y -= adjustment;
        } else {
          sourcePos.y -= adjustment;
          targetPos.y += adjustment;
        }
      }
    }
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
