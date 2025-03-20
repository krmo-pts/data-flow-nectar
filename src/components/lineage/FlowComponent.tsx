
import React, { memo, useEffect } from 'react';
import { ReactFlow, Connection, Node, Edge } from 'reactflow';

import { nodeTypes, edgeTypes } from './flow/FlowTypeDefinitions';
import { useFlowOptions } from './flow/FlowOptions';
import { useEdgeOptimizer } from './flow/EdgeOptimizer';
import FlowElements from './flow/FlowElements';

interface FlowComponentProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  handleNodeClick: (event: React.MouseEvent, node: any) => void;
  handleEdgeClick: (event: React.MouseEvent, edge: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  resetView: () => void;
  resetPanels: () => void;
  isDragging?: boolean;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
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
  resetPanels,
  isDragging = false,
  setNodes,
  setEdges,
}) => {
  // Get ReactFlow options
  const rfOptions = useFlowOptions();
  
  // Optimize edges rendering based on zoom level and dragging state
  const { visibleEdges } = useEdgeOptimizer(edges, nodes, isDragging);

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
      style={{ height: '100%', width: '100%' }}
      nodeOrigin={[0.5, 0.5]}
      elementsSelectable={true}
      {...rfOptions}
    >
      <FlowElements
        nodes={nodes}
        setNodes={setNodes}
        setEdges={setEdges}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        resetView={resetView}
        resetPanels={resetPanels}
      />
    </ReactFlow>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(FlowComponent);
