
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
    console.log('FlowComponent drag state changed:', {
      isDragging,
      nodesCount: nodes.length,
      edgesCount: edges.length,
      visibleEdgesCount: visibleEdges.length,
      zoom
    });
  }, [isDragging, nodes.length, edges.length, visibleEdges.length, zoom]);

  // Determine which edges to show - during dragging show fewer edges for performance
  const edgesToRender = isDragging && edges.length > 50 
    ? visibleEdges.slice(0, 50) // During dragging, show minimal edges
    : zoom < 0.5 && edges.length > 100 
      ? visibleEdges // When zoomed out with many edges, filter
      : edges; // Otherwise show all edges
      
  console.log('Rendering edges:', {
    totalEdges: edges.length,
    renderedEdges: edgesToRender.length,
    filtering: isDragging || (zoom < 0.5 && edges.length > 100)
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edgesToRender}
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
