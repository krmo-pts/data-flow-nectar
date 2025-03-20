
import React, { useCallback, useState } from 'react';
import { useLineageSearch } from '@/hooks/useLineageSearch';
import { Node, Edge } from 'reactflow';

interface LineageSearchProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  resetView: () => void;
  resetPanels: () => void;
}

const LineageSearch: React.FC<LineageSearchProps> = ({
  nodes,
  setNodes,
  setEdges,
  resetView,
  resetPanels
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { handleSearch } = useLineageSearch(nodes, setNodes, setEdges);
  
  const handleSearchQuery = useCallback(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const handleResetView = useCallback(() => {
    resetView();
    setSearchQuery('');
    resetPanels();
  }, [resetView, resetPanels]);

  return {
    searchQuery,
    setSearchQuery,
    handleSearchQuery,
    handleResetView
  };
};

export default LineageSearch;
