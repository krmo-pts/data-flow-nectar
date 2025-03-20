
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
  
  // Sort levels for consistent layout
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
  
  // Position nodes based on their level and order with improved spacing
  const levelWidth = 350; // Increased horizontal spacing between levels
  const nodeHeight = 180; // Increased estimated node height for better spacing
  const nodeSpacing = 60; // Vertical spacing between nodes
  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  sortedLevels.forEach((level) => {
    const nodesInLevel = nodesByLevel.get(level) || [];
    // Calculate total required height including spacing
    const totalHeight = nodesInLevel.length * nodeHeight + (nodesInLevel.length - 1) * nodeSpacing;
    const startY = -totalHeight / 2; // Center vertically
    
    nodesInLevel.forEach((nodeId, index) => {
      // Position with extra spacing between nodes
      nodePositions[nodeId] = {
        x: level * levelWidth,
        // Position nodes with explicit spacing between them
        y: startY + index * (nodeHeight + nodeSpacing),
      };
    });
  });
  
  // Apply force-based adjustments to reduce node overlaps
  const applyForceDirectedAdjustments = () => {
    const repulsionForce = 100; // Strength of repulsion between nodes
    const iterations = 30; // Number of iterations for force calculation
    
    for (let i = 0; i < iterations; i++) {
      // For each pair of nodes, calculate repulsion and adjust positions
      const nodeIds = Array.from(nodePositions.keys());
      
      for (let j = 0; j < nodeIds.length; j++) {
        for (let k = j + 1; k < nodeIds.length; k++) {
          const id1 = nodeIds[j];
          const id2 = nodeIds[k];
          
          const pos1 = nodePositions[id1];
          const pos2 = nodePositions[id2];
          
          // Skip nodes that are far apart horizontally (different levels)
          if (Math.abs(pos1.x - pos2.x) > levelWidth) continue;
          
          // Calculate distance and direction
          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If nodes are too close, apply repulsion
          if (distance < nodeHeight) {
            // Only apply strong vertical repulsion when nodes are at the same level
            const repulsion = repulsionForce / Math.max(distance, 10);
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Mostly adjust vertical position
            const adjustX = Math.abs(dx) < 10 ? dirX * repulsion * 0.1 : 0;
            const adjustY = dirY * repulsion;
            
            // Apply adjustments (with more weight to vertical adjustment)
            pos1.x -= adjustX;
            pos1.y -= adjustY;
            pos2.x += adjustX;
            pos2.y += adjustY;
          }
        }
      }
    }
  };
  
  // Apply force-directed adjustments to reduce overlaps
  applyForceDirectedAdjustments();
  
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
  
  // Create edges with specific connection points and styling
  const flowEdges = edges.map((edge) => {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: edge,
      type: 'default',
      animated: false,
      // Connect to the header section of nodes
      sourceHandle: 'header',
      targetHandle: 'header',
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
