
import React from 'react';
import FlowBackground from '../FlowBackground';
import FlowControls from '../FlowControls';
import FlowMiniMap from '../FlowMiniMap';
import SearchPanel from '../SearchPanel';
import ControlPanel from '../ControlPanel';

interface FlowElementsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  resetView: () => void;
}

/**
 * Component that renders all the UI elements in the ReactFlow canvas
 */
const FlowElements: React.FC<FlowElementsProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  resetView
}) => {
  return (
    <>
      <FlowBackground />
      <FlowControls />
      <FlowMiniMap />
      
      <SearchPanel 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />
      
      <ControlPanel resetView={resetView} />
    </>
  );
};

export default FlowElements;
