
import { NodeData, EdgeData } from '@/types/lineage';
import { Node, Edge, MarkerType } from 'reactflow';

export const calculateInitialLayout = (
  nodes: NodeData[],
  edges: EdgeData[]
): { flowNodes: Node[], flowEdges: Edge[] } => {
  console.time('layoutCalculation');
  
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
  
  // Check if we're using a large dataset (more efficient than passing it as a parameter)
  const isLargeDataset = nodes.length > 100;
  
  // For large datasets, use a simplified layout algorithm
  if (isLargeDataset) {
    return calculateLargeDatasetLayout(nodes, edges, nodeMap, incomingEdges, outgoingEdges);
  }
  
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
  
  // Optimize node positioning within levels to minimize edge crossings
  // This implementation uses the barycenter heuristic for edge crossing minimization
  const sortNodesInLevel = (level: number, prevLevelNodes: string[] | null) => {
    const nodesInLevel = nodesByLevel.get(level) || [];
    
    if (!prevLevelNodes || prevLevelNodes.length === 0 || nodesInLevel.length <= 1) {
      return nodesInLevel;
    }
    
    // For large datasets, limit the number of iterations for optimization
    // to avoid performance issues
    const maxIterations = nodes.length > 100 ? 1 : 3;
    
    let currentOrder = [...nodesInLevel];
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Calculate average position of connected nodes from previous level
      const nodePositionWeights = new Map<string, number>();
      
      currentOrder.forEach(nodeId => {
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
      currentOrder = [...currentOrder].sort((a, b) => {
        const weightA = nodePositionWeights.get(a) || 0;
        const weightB = nodePositionWeights.get(b) || 0;
        return weightA - weightB;
      });
    }
    
    return currentOrder;
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
  
  // Position nodes based on their level and order
  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  // For larger datasets, use more compact spacing
  const levelWidth = 400; 
  const nodeHeight = 150;
  const nodeWidth = 250;
  const nodePaddingY = 100;
  
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

  console.timeEnd('layoutCalculation');
  console.log(`Positioned ${flowNodes.length} nodes and ${flowEdges.length} edges`);
  
  return { flowNodes, flowEdges };
};

// Specialized layout algorithm for large datasets
const calculateLargeDatasetLayout = (
  nodes: NodeData[],
  edges: EdgeData[],
  nodeMap: Map<string, NodeData>,
  incomingEdges: Map<string, string[]>,
  outgoingEdges: Map<string, string[]>
): { flowNodes: Node[], flowEdges: Edge[] } => {
  console.log('Using optimized layout for large dataset');
  
  // Use force-directed-like layout for large datasets
  const gridSize = Math.ceil(Math.sqrt(nodes.length));
  const cellWidth = 250;
  const cellHeight = 180;
  const gridWidth = gridSize * cellWidth;
  
  // Categorize nodes into types to group them
  const nodesByType: Record<string, string[]> = {};
  
  nodes.forEach(node => {
    if (!nodesByType[node.type]) {
      nodesByType[node.type] = [];
    }
    nodesByType[node.type].push(node.id);
  });
  
  // Position nodes by type in a grid pattern
  const nodePositions: Record<string, { x: number; y: number }> = {};
  let currentTypeIndex = 0;
  
  for (const type in nodesByType) {
    const nodesOfType = nodesByType[type];
    const typeGridSize = Math.ceil(Math.sqrt(nodesOfType.length));
    const typeStartX = (currentTypeIndex % 3) * gridWidth;
    const typeStartY = Math.floor(currentTypeIndex / 3) * gridWidth;
    
    nodesOfType.forEach((nodeId, index) => {
      const col = index % typeGridSize;
      const row = Math.floor(index / typeGridSize);
      
      nodePositions[nodeId] = {
        x: typeStartX + col * cellWidth + Math.random() * 20,
        y: typeStartY + row * cellHeight + Math.random() * 20,
      };
    });
    
    currentTypeIndex++;
  }
  
  // Create React Flow nodes with positioned data
  const flowNodes = nodes.map((node) => {
    const position = nodePositions[node.id] || { 
      x: Math.random() * gridWidth, 
      y: Math.random() * gridWidth 
    };
    
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
