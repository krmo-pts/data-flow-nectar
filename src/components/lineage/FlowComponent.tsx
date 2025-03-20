
import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  BackgroundVariant,
  MarkerType,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';

import BaseNode from './nodes/BaseNode';
import CustomEdge from './edges/CustomEdge';
import SearchPanel from './SearchPanel';
import ControlPanel from './ControlPanel';

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
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      minZoom={0.2}
      maxZoom={2}
      snapToGrid={true}
      attributionPosition="bottom-right"
      className="lineage-flow"
    >
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      <Controls className="glass-panel" />
      <MiniMap
        nodeColor={(node) => {
          switch (node.data.type) {
            case 'table':
              return '#dbeafe';
            case 'task':
              return '#dcfce7';
            case 'report':
              return '#f3e8ff';
            default:
              return '#f1f5f9';
          }
        }}
        maskColor="rgba(240, 240, 250, 0.1)"
        className="glass-panel"
      />
      
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
