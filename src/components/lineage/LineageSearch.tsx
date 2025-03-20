
import React, { useCallback, useState } from 'react';
import { useLineageSearch } from '@/hooks/useLineageSearch';
import { Node, Edge } from 'reactflow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

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

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-64 h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearchQuery();
          }
        }}
      />
      <Button size="sm" onClick={handleSearchQuery} className="h-8 px-2">
        <Search className="h-4 w-4" />
      </Button>
      <Button size="sm" onClick={handleResetView} className="h-8 px-2" variant="outline">
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LineageSearch;
