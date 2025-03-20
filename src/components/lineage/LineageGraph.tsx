
import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  NodeTypes,
  EdgeTypes,
  BackgroundVariant,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { NodeData, EdgeData } from '@/types/lineage';
import BaseNode from './nodes/BaseNode';
import CustomEdge from './edges/CustomEdge';
import NodeDetailsPanel from './NodeDetailsPanel';
import EdgeDetailsPanel from './EdgeDetailsPanel';
import SearchPanel from './SearchPanel';
import ControlPanel from './ControlPanel';
import { mockLineageData } from '@/data/mockLineageData';
import { calculateInitialLayout } from '@/utils/lineageLayout';
import { useLineageSearch } from '@/hooks/useLineageSearch';
import { useDetailsPanels } from '@/hooks/useDetailsPanels';

const nodeTypes: NodeTypes = {
  default: BaseNode,
};

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
};

const LineageGraph: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const reactFlowInstance = useReactFlow();
  const { handleSearch } = useLineageSearch(nodes, setNodes, setEdges);
  const { 
    selectedNode,
    selectedEdge,
    isNodePanelOpen,
    isEdgePanelOpen,
    handleNodeClick,
    handleEdgeClick,
    handleCloseNodePanel,
    handleCloseEdgePanel,
    resetPanels
  } = useDetailsPanels();
  
  const initialLayout = useCallback(() => {
    const { flowNodes, flowEdges } = calculateInitialLayout(
      mockLineageData.nodes,
      mockLineageData.edges
    );
    
    setNodes(flowNodes);
    setEdges(flowEdges);
    
    // Fit view after a short delay to ensure nodes are rendered
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.3 });
    }, 100);
  }, [reactFlowInstance, setEdges, setNodes]);

  useEffect(() => {
    initialLayout();
  }, [initialLayout]);

  const onConnect = useCallback(
    (params: Connection) => {
      // In a real application, you would create a new edge here and persist it
      setEdges((eds) => 
        addEdge({
          ...params,
          data: { label: 'New Connection' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#64748b',
          },
          type: 'default',
        }, eds)
      );
    },
    [setEdges]
  );

  const handleSearchQuery = useCallback(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const resetView = useCallback(() => {
    initialLayout();
    setSearchQuery('');
    resetPanels();
  }, [initialLayout, resetPanels]);

  return (
    <div className="w-full h-full relative">
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
        minZoom={0.2}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-right"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#e2e8f0" 
          style={{ opacity: 0.6 }}
        />
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
          zoomable
          pannable
        />
        
        <Panel position="top-left" className="glass-panel rounded-md p-3 m-3">
          <h3 className="text-sm font-medium mb-2">Data Lineage</h3>
          <div className="text-xs text-gray-500">
            Visualizing dependencies and relationships between data assets
          </div>
        </Panel>
        
        <SearchPanel 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearchQuery}
        />
        
        <ControlPanel resetView={resetView} />
      </ReactFlow>
      
      <NodeDetailsPanel 
        node={selectedNode} 
        onClose={handleCloseNodePanel} 
        isOpen={isNodePanelOpen} 
      />
      
      <EdgeDetailsPanel 
        edge={selectedEdge} 
        onClose={handleCloseEdgePanel} 
        isOpen={isEdgePanelOpen} 
      />
    </div>
  );
};

export default LineageGraph;
