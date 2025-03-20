
import { Edge, Node, Position } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';

/**
 * Calculate initial layout for the lineage graph
 */
export const calculateInitialLayout = (
  nodes: NodeData[],
  edges: EdgeData[]
): { flowNodes: Node<NodeData>[]; flowEdges: Edge<EdgeData>[]; } => {
  const flowNodes: Node<NodeData>[] = [];
  const nodeMap = new Map<string, Node<NodeData>>();
  
  // First pass: create nodes and store in the map
  nodes.forEach((node, index) => {
    // Position nodes in a grid layout initially
    const rows = Math.ceil(Math.sqrt(nodes.length));
    const cols = Math.ceil(nodes.length / rows);
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // Space nodes evenly in a grid
    const xSpacing = 400;
    const ySpacing = 300;
    
    const x = col * xSpacing;
    const y = row * ySpacing;
    
    const flowNode: Node<NodeData> = {
      id: node.id,
      type: 'default',
      position: { x, y },
      data: { ...node },
    };
    
    flowNodes.push(flowNode);
    nodeMap.set(node.id, flowNode);
  });
  
  // Adjust positions to avoid node overlaps
  const nodesWithLevels = assignLevels(flowNodes, edges);
  const levelGroups = groupNodesByLevel(nodesWithLevels);
  
  // Position nodes by level
  positionNodesByLevel(levelGroups);
  
  // Handle edges
  const flowEdges: Edge<EdgeData>[] = edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    // Default position if nodes not found
    let sourcePosition = Position.Right;
    let targetPosition = Position.Left;
    
    // Determine source and target positions based on node placement
    if (sourceNode && targetNode) {
      if (sourceNode.position.y > targetNode.position.y + 100) {
        sourcePosition = Position.Top;
        targetPosition = Position.Bottom;
      } else if (sourceNode.position.y < targetNode.position.y - 100) {
        sourcePosition = Position.Bottom;
        targetPosition = Position.Top;
      } else if (sourceNode.position.x < targetNode.position.x) {
        sourcePosition = Position.Right;
        targetPosition = Position.Left;
      } else {
        sourcePosition = Position.Left;
        targetPosition = Position.Right;
      }
    }
    
    return {
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: sourcePosition,
      targetHandle: targetPosition,
      type: 'default',
      data: { ...edge },
      markerEnd: {
        type: 'arrowclosed',
        width: 15,
        height: 15,
        color: '#64748b',
      },
    };
  });
  
  return { flowNodes, flowEdges };
};

/**
 * Assign depth levels to nodes based on edge connections
 */
const assignLevels = (nodes: Node<NodeData>[], edges: EdgeData[]): Node<NodeData>[] => {
  const nodeMap = new Map<string, Node<NodeData> & { level?: number }>();
  
  // Initialize the map
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, level: 0 });
  });
  
  // Create adjacency list for topological sorting
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  // Initialize
  nodes.forEach(node => {
    graph[node.id] = [];
    inDegree[node.id] = 0;
  });
  
  // Build the graph
  edges.forEach(edge => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }
  });
  
  // Find source nodes (nodes with no incoming edges)
  const sourceNodes: string[] = [];
  nodes.forEach(node => {
    if (inDegree[node.id] === 0) {
      sourceNodes.push(node.id);
    }
  });
  
  // Perform BFS to assign levels
  const queue = [...sourceNodes];
  
  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId) continue;
    
    const node = nodeMap.get(nodeId);
    const currentLevel = node?.level || 0;
    
    // Add all adjacent nodes to queue and update their level
    const neighbors = graph[nodeId] || [];
    neighbors.forEach(neighborId => {
      const neighbor = nodeMap.get(neighborId);
      if (neighbor) {
        // Set neighbor level to be at least one level more than current node
        neighbor.level = Math.max((neighbor.level || 0), currentLevel + 1);
      }
      
      // Decrease in-degree of neighbor
      inDegree[neighborId]--;
      
      // If in-degree becomes 0, add to queue
      if (inDegree[neighborId] === 0) {
        queue.push(neighborId);
      }
    });
  }
  
  // Return nodes with levels
  return Array.from(nodeMap.values());
};

/**
 * Group nodes by their level
 */
const groupNodesByLevel = (nodes: (Node<NodeData> & { level?: number })[]): Record<number, Node<NodeData>[]> => {
  const levelGroups: Record<number, Node<NodeData>[]> = {};
  
  nodes.forEach(node => {
    const level = node.level || 0;
    if (!levelGroups[level]) {
      levelGroups[level] = [];
    }
    levelGroups[level].push(node);
  });
  
  return levelGroups;
};

/**
 * Position nodes by their level
 */
const positionNodesByLevel = (levelGroups: Record<number, Node<NodeData>[]>): void => {
  const levelSpacing = 400; // Horizontal spacing between levels
  const nodeSpacing = 250;  // Vertical spacing between nodes in the same level
  
  Object.entries(levelGroups).forEach(([levelStr, nodes]) => {
    const level = parseInt(levelStr, 10);
    const x = level * levelSpacing + 50;
    
    nodes.forEach((node, index) => {
      // Center nodes vertically
      const totalHeight = nodes.length * nodeSpacing;
      const startY = -totalHeight / 2 + nodeSpacing / 2;
      const y = startY + index * nodeSpacing;
      
      node.position = { x, y };
    });
  });
};
