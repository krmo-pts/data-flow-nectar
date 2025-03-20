
import { Node, Edge } from 'reactflow';
import { toast } from '@/hooks/use-toast';

/**
 * Resets all nodes and edges to their default style by removing impact analysis data
 */
export const resetImpactAnalysis = (
  prevNodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Reset the nodes to remove analysis data
  setNodes(prevNodes => {
    return prevNodes.map(node => {
      // Reset node data
      const updatedNodeData = {
        ...node.data,
        isFocus: false,
        impactType: 'none',
        impactDistance: undefined
      };
      
      // Reset node styling
      let nodeClassName = `node-${updatedNodeData.type}`;
      
      return {
        ...node,
        data: updatedNodeData,
        className: nodeClassName
      };
    });
  });
  
  // Reset all edges to default styling
  setEdges(prevEdges => {
    return prevEdges.map(edge => {
      return {
        ...edge,
        data: { ...edge.data, isImpactPath: false },
        animated: false,
        style: { ...edge.style, strokeWidth: 1.5, opacity: 0.8 }
      };
    });
  });
  
  // Set analyzing to false
  setIsAnalyzing(false);
  
  // Notify the user
  toast({
    title: "Focus cleared",
    description: "All impact analysis has been reset",
  });
};
