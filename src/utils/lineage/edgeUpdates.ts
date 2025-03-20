
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
        // Apply different colors based on impact type (upstream/downstream)
        const impactColor = nodeMap.get(edge.source)?.impactType === 'upstream' ? 
          '#3b82f6' : // Blue for upstream
          '#ef4444';  // Red for downstream
          
        return {
          ...edge,
          data: { ...edge.data, ...edgeData },
          animated: true,
          className: 'impact-path-edge',
          style: { 
            ...edge.style, 
            strokeWidth: 2, 
            opacity: 1,
            stroke: impactColor
          }
        };
      }
      
      // Default style for edges not in impact path
      return {
        ...edge,
        data: { ...edge.data, isImpactPath: false },
        animated: false,
        className: '',
        style: { ...edge.style, strokeWidth: 1.5, opacity: 0.5 }
      };
    });
  });
  
  // Set analyzing to false when edges are updated
  setIsAnalyzing(false);
};
