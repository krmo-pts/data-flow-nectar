
import React from 'react';
import FlowBackground from '../FlowBackground';
import FlowMiniMap from '../FlowMiniMap';
import SearchPanel from '../SearchPanel';
import ControlPanel from '../ControlPanel';
import { Node, Edge } from 'reactflow';

interface FlowElementsProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  resetView: () => void;
  resetPanels: () => void;
}

/**
 * Component that renders all the UI elements in the ReactFlow canvas
 */
const FlowElements: React.FC<FlowElementsProps> = ({
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
    <>
      <FlowBackground />
      {/* Removed FlowControls component to eliminate duplication */}
      <FlowMiniMap />
      
      <SearchPanel 
        nodes={nodes}
        setNodes={setNodes}
        setEdges={setEdges}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        resetView={resetView}
        resetPanels={resetPanels}
      />
      
      <ControlPanel resetView={resetView} />
    </>
  );
};

export default FlowElements;
