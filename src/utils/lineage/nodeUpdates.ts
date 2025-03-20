
import { Node } from 'reactflow';
import { NodeData } from '@/types/lineage';

/**
 * Updates nodes based on the dependency analysis results
 */
export const updateNodesWithAnalysisResults = (
  prevNodes: Node[],
  nodeMap: Map<string, NodeData>,
  nodeId: string
): Node[] => {
  // Return updated nodes with dependency analysis
  return prevNodes.map(node => {
    const nodeData = nodeMap.get(node.id);
    if (!nodeData) return node;
    
    // Apply styling based on impact relationship
    let nodeClassName = `node-${nodeData.type}`;
    
    if (nodeData.isFocus) {
      nodeClassName += ' focus-node';
    } else if (nodeData.impactType === 'upstream') {
      nodeClassName += ' upstream-node';
    } else if (nodeData.impactType === 'downstream') {
      nodeClassName += ' downstream-node';
    }
    
    return {
      ...node,
      data: nodeData,
      className: nodeClassName
    };
  });
};

/**
 * Centers the view on the focus node
 */
export const zoomToFocusNode = (
  nodeId: string,
  prevNodes: Node[],
  reactFlowInstance: any,
  nodesCount: number
) => {
  setTimeout(() => {
    const focusNode = prevNodes.find(node => node.id === nodeId);
    if (focusNode) {
      reactFlowInstance.setCenter(focusNode.position.x, focusNode.position.y, { 
        duration: 800, 
        zoom: nodesCount > 300 ? 1.2 : 1.5 // Use a less zoomed-in view for large graphs
      });
    }
  }, 50);
};
