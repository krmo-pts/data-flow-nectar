
import React, { memo, useEffect, useMemo, useCallback } from 'react';
import { ReactFlow, Connection, Node, Edge, useReactFlow } from 'reactflow';

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
  const reactFlowInstance = useReactFlow();
  
  // Use memo for edges to prevent unnecessary recalculations
  const memoizedEdges = useMemo(() => edges, [edges]);
  const memoizedNodes = useMemo(() => nodes, [nodes]);
  
  // Optimize edges rendering based on zoom level and dragging state
  const { visibleEdges, zoom } = useEdgeOptimizer(memoizedEdges, memoizedNodes, isDragging);

  // Update the container class based on zoom level
  useEffect(() => {
    const container = document.querySelector('.react-flow');
    if (container) {
      if (zoom < 0.5) {
        container.classList.add('zoomed-out');
      } else {
        container.classList.remove('zoomed-out');
      }
    }
  }, [zoom]);

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
      fitViewOptions={{ padding: 0.1 }}
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
