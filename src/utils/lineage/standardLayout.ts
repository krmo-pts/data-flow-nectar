
import { Node, Edge, MarkerType } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';
import { NodeMaps, LayoutResult } from './types';

export const calculateStandardLayout = (
  nodes: NodeData[],
  edges: EdgeData[],
  nodeMaps: NodeMaps
): LayoutResult => {
  const { incomingEdges, outgoingEdges } = nodeMaps;
  
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
  
  return { flowNodes, flowEdges };
};
