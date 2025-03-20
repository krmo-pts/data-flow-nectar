
import React from 'react';
import { Panel } from 'reactflow';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch 
}) => {
  return (
    <Panel position="top-left" className="glass-panel p-2 rounded-md flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-64 h-8 text-sm"
      />
      <Button size="sm" onClick={handleSearch} className="h-8 px-2">
        <Search className="h-4 w-4" />
      </Button>
    </Panel>
  );
};

export default SearchPanel;
