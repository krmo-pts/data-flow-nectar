
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

const nodeTypes: NodeTypes = {
  default: BaseNode,
};

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
};

const LineageGraph: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<EdgeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isEdgePanelOpen, setIsEdgePanelOpen] = useState(false);

  const reactFlowInstance = useReactFlow();
  const { handleSearch } = useLineageSearch(nodes, setNodes, setEdges);
  
  const initialLayout = useCallback(() => {
    const { flowNodes, flowEdges } = calculateInitialLayout(
      mockLineageData.nodes,
      mockLineageData.edges
    );
    
    setNodes(flowNodes);
    setEdges(flowEdges);
    
    // Fit view after a short delay to ensure nodes are rendered
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
    }, 50);
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

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const nodeData = mockLineageData.nodes.find(n => n.id === node.id) || null;
    setSelectedNode(nodeData);
    setSelectedEdge(null);
    setIsNodePanelOpen(true);
    setIsEdgePanelOpen(false);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const edgeData = mockLineageData.edges.find(e => e.id === edge.id) || null;
    setSelectedEdge(edgeData);
    setSelectedNode(null);
    setIsNodePanelOpen(false);
    setIsEdgePanelOpen(true);
  }, []);

  const handleCloseNodePanel = useCallback(() => {
    setIsNodePanelOpen(false);
  }, []);

  const handleCloseEdgePanel = useCallback(() => {
    setIsEdgePanelOpen(false);
  }, []);

  const handleSearchQuery = useCallback(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const resetView = useCallback(() => {
    initialLayout();
    setSearchQuery('');
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsNodePanelOpen(false);
    setIsEdgePanelOpen(false);
  }, [initialLayout]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid={true}
        attributionPosition="bottom-right"
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
