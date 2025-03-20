
import { Edge } from 'reactflow';
import { EdgeData, NodeData } from '@/types/lineage';

/**
 * Updates edges based on the impact analysis
 */
export const updateEdgesWithImpactPath = (
  prevEdges: Edge[],
  edgesMap: Map<string, EdgeData>,
  nodeMap: Map<string, NodeData>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setEdges(prevEdges => {
    return prevEdges.map(edge => {
      const edgeKey = `${edge.source}->${edge.target}`;
      const edgeData = edgesMap.get(edgeKey);
      
      if (edgeData?.isImpactPath) {
        return {
          ...edge,
          data: edgeData,
          animated: true,
          style: { 
            ...edge.style, 
            strokeWidth: 2, 
            opacity: 1,
            stroke: nodeMap.get(edge.source)?.impactType === 'upstream' ? '#3b82f6' : '#ef4444'
          }
        };
      }
      
      return edge;
    });
  });
  
  // Set analyzing to false when edges are updated
  setIsAnalyzing(false);
};
