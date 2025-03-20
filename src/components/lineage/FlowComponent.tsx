
import React, { useMemo } from 'react';
import {
  ReactFlow,
  Connection,
  NodeTypes,
  EdgeTypes,
  useStore,
} from 'reactflow';

import BaseNode from './nodes/BaseNode';
import CustomEdge from './edges/CustomEdge';
import SearchPanel from './SearchPanel';
import ControlPanel from './ControlPanel';
import FlowMiniMap from './FlowMiniMap';
import FlowControls from './FlowControls';
import FlowBackground from './FlowBackground';

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
}

const nodeTypes: NodeTypes = {
  default: BaseNode,
};

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
};

// Custom selector function for better performance
const edgeSelector = (state: any) => ({
  transform: state.transform,
  nodesDraggable: state.nodesDraggable,
});

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
}) => {
  // Get current zoom level to conditionally render edges
  const { transform } = useStore(edgeSelector);
  const zoom = transform[2];
  
  // Optimize edges rendering based on zoom level
  const visibleEdges = useMemo(() => {
    if (zoom < 0.5 && edges.length > 100) {
      // When zoomed out with many edges, hide edges between distant nodes
      return edges.filter(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return false;
        
        // Calculate distance between nodes
        const dx = source.position.x - target.position.x;
        const dy = source.position.y - target.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only show edges for relatively close nodes when zoomed out
        return distance < 800;
      });
    }
    return edges;
  }, [edges, nodes, zoom]);

  // Performance options for ReactFlow
  const rfOptions = useMemo(() => ({
    maxZoom: 2,
    minZoom: 0.2,
    snapToGrid: true,
    snapGrid: [15, 15],
    nodesDraggable: true,
    elevateEdgesOnSelect: true,
    elevateNodesOnSelect: true,
    focusable: true,
  }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={zoom < 0.5 && edges.length > 100 ? visibleEdges : edges}
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
      className="lineage-flow"
      {...rfOptions}
    >
      <FlowBackground />
      <FlowControls />
      <FlowMiniMap />
      
      <SearchPanel 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />
      
      <ControlPanel resetView={resetView} />
    </ReactFlow>
  );
};

export default FlowComponent;
