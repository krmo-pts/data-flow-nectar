
import React from 'react';
import { Panel } from 'reactflow';
import LineageSearch from './LineageSearch';
import { Node, Edge } from 'reactflow';

interface SearchPanelProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  resetView: () => void;
  resetPanels: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ 
  nodes,
  setNodes,
  setEdges,
  searchQuery, 
  setSearchQuery, 
  handleSearch,
  resetView,
  resetPanels
}) => {
  return (
    <Panel position="top-left" className="glass-panel p-2 rounded-md">
      <LineageSearch 
        nodes={nodes}
        setNodes={setNodes}
        setEdges={setEdges}
        resetView={resetView}
        resetPanels={resetPanels}
      />
    </Panel>
  );
};

export default SearchPanel;
