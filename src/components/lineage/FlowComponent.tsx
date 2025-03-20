
import React, { memo, useEffect } from 'react';
import { ReactFlow, Connection } from 'reactflow';

import { nodeTypes, edgeTypes } from './flow/FlowTypeDefinitions';
import { useFlowOptions } from './flow/FlowOptions';
import { useEdgeOptimizer } from './flow/EdgeOptimizer';
import FlowElements from './flow/FlowElements';

interface FlowComponentProps {
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  handleNodeClick: (event: React.MouseEvent, node: any) => void;
  handleEdgeClick: (event: React.MouseEvent, edge: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  resetView: () => void;
  isDragging?: boolean;
}

const FlowComponent: React.FC<FlowComponentProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  handleNodeClick,
  handleEdgeClick,
  searchQuery,
  setSearchQuery,
  handleSearch,
  resetView,
  isDragging = false,
}) => {
  // Get ReactFlow options
  const rfOptions = useFlowOptions();
  
  // Optimize edges rendering based on zoom level and dragging state
  const { visibleEdges, zoom } = useEdgeOptimizer(edges, nodes, isDragging);

  // Log drag state changes
  useEffect(() => {
    if (isDragging) {
      console.log('FlowComponent: Dragging with', {
        visibleEdges: visibleEdges.length,
        totalEdges: edges.length
      });
    }
  }, [isDragging, visibleEdges.length, edges.length]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={visibleEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      nodesDraggable={true}
      attributionPosition="bottom-right"
      className={`lineage-flow ${isDragging ? 'is-dragging' : ''}`}
      {...rfOptions}
    >
      <FlowElements
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        resetView={resetView}
      />
    </ReactFlow>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(FlowComponent);
