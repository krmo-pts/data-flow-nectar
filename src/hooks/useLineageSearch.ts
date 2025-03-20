
import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/lineage';

export const useLineageSearch = (
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery) {
      // Reset highlight if search is empty
      setNodes((nds) => 
        nds.map((node) => ({
          ...node,
          className: `node-${(node.data as NodeData).type}`,
        }))
      );
      
      // Reset edges
      setEdges(prevEdges => 
        prevEdges.map(edge => ({
          ...edge,
          className: ''
        }))
      );
      
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Highlight nodes that match the search query
    setNodes((nds) => 
      nds.map((node) => {
        const data = node.data as NodeData;
        const matches = 
          data.name.toLowerCase().includes(query) ||
          data.path.toLowerCase().includes(query) ||
          data.platform.toLowerCase().includes(query) ||
          data.type.toLowerCase().includes(query) ||
          data.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          false;
        
        return {
          ...node,
          className: matches 
            ? `node-${data.type} border-primary shadow-md ring-2 ring-primary/20` 
            : `node-${data.type} opacity-40`,
        };
      })
    );
    
    // Also update edges to show/hide based on connected nodes
    setEdges((eds) => 
      eds.map((edge) => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === edge.target);
        
        const sourceData = sourceNode?.data as NodeData;
        const targetData = targetNode?.data as NodeData;
        
        const sourceMatches = 
          sourceData?.name.toLowerCase().includes(query) ||
          sourceData?.path.toLowerCase().includes(query) ||
          sourceData?.platform.toLowerCase().includes(query) ||
          sourceData?.type.toLowerCase().includes(query) ||
          sourceData?.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          false;
          
        const targetMatches = 
          targetData?.name.toLowerCase().includes(query) ||
          targetData?.path.toLowerCase().includes(query) ||
          targetData?.platform.toLowerCase().includes(query) ||
          targetData?.type.toLowerCase().includes(query) ||
          targetData?.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          false;
        
        return {
          ...edge,
          className: sourceMatches || targetMatches ? '' : 'opacity-20',
        };
      })
    );
  }, [nodes, setEdges, setNodes]);
  
  return { handleSearch };
};
