
import { Node, Edge, MarkerType } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';
import { NodeMaps, LayoutResult } from './types';

export const calculateLargeDatasetLayout = (
  nodes: NodeData[],
  edges: EdgeData[],
  nodeMaps: NodeMaps
): LayoutResult => {
  console.log('Using optimized layout for large dataset');
  
  const { incomingEdges, outgoingEdges } = nodeMaps;
  
  // Calculate node levels based on dependencies (simplified version of the main algorithm)
  const nodeLevels = new Map<string, number>();
  const visited = new Set<string>();
  
  // Find source nodes (nodes with no incoming edges)
  const sourceNodes: string[] = [];
  nodes.forEach(node => {
    const incoming = incomingEdges.get(node.id) || [];
    if (incoming.length === 0) {
      sourceNodes.push(node.id);
      nodeLevels.set(node.id, 0);
    }
  });
  
  // If no source nodes found (perhaps due to cycles), choose some nodes as sources
  if (sourceNodes.length === 0) {
    // Take first 10% of nodes as sources
    const sourcesCount = Math.max(1, Math.floor(nodes.length * 0.1));
    for (let i = 0; i < sourcesCount; i++) {
      sourceNodes.push(nodes[i].id);
      nodeLevels.set(nodes[i].id, 0);
    }
  }
  
  // Breadth-first traversal to assign levels
  const queue = [...sourceNodes];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    
    const level = nodeLevels.get(nodeId) || 0;
    const targets = outgoingEdges.get(nodeId) || [];
    
    targets.forEach(targetId => {
      // Assign level to target node (one level higher than current node)
      const targetLevel = (nodeLevels.get(targetId) !== undefined) 
        ? Math.max(level + 1, nodeLevels.get(targetId)!) 
        : level + 1;
      
      nodeLevels.set(targetId, targetLevel);
      queue.push(targetId);
    });
  }
  
  // For nodes that weren't assigned a level (isolated nodes or in cycles not reached)
  // assign them a reasonable level
  nodes.forEach(node => {
    if (!nodeLevels.has(node.id)) {
      // Check if we have any information from incoming edges
      const incoming = incomingEdges.get(node.id) || [];
      const incomingLevels = incoming
        .map(sourceId => nodeLevels.get(sourceId))
        .filter(level => level !== undefined) as number[];
      
      if (incomingLevels.length > 0) {
        // Place after its highest incoming node
        nodeLevels.set(node.id, Math.max(...incomingLevels) + 1);
      } else {
        // Just assign a middle level
        nodeLevels.set(node.id, Math.floor(Math.random() * 5));
      }
    }
  });
  
  // Group nodes by their level
  const nodesByLevel = new Map<number, string[]>();
  nodeLevels.forEach((level, nodeId) => {
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(nodeId);
  });
  
  // Layout constants
  const levelWidth = 350;
  const nodeHeight = 150;
  const nodeSpacing = 100; // Vertical space between nodes
  
  // Position nodes based on level and some jitter within each level
  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  // Sort levels and position nodes
  const sortedLevels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
  
  sortedLevels.forEach(level => {
    const nodesInLevel = nodesByLevel.get(level) || [];
    const levelX = level * levelWidth;
    
    // Sort nodes in level by their connections to minimize edge crossings
    nodesInLevel.sort((a, b) => {
      const aIncoming = incomingEdges.get(a) || [];
      const bIncoming = incomingEdges.get(b) || [];
      return aIncoming.length - bIncoming.length;
    });
    
    // Distribute nodes vertically
    const levelHeight = nodesInLevel.length * (nodeHeight + nodeSpacing);
    let startY = -levelHeight / 2; // Center vertically
    
    nodesInLevel.forEach((nodeId, index) => {
      // Add small horizontal jitter to make it look more natural
      const jitterX = Math.random() * 80 - 40; // ±40px jitter
      
      nodePositions[nodeId] = {
        x: levelX + jitterX,
        y: startY + index * (nodeHeight + nodeSpacing)
      };
    });
  });
  
  // Create React Flow nodes with positioned data
  const flowNodes = nodes.map((node) => {
    const position = nodePositions[node.id] || { 
      x: Math.random() * 1000, 
      y: Math.random() * 1000 
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
