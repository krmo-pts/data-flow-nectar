
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
import { mockLargeLineageData } from '@/data/mockLargeLineageData';
import { calculateInitialLayout } from '@/utils/lineageLayout';
import { useLineageSearch } from '@/hooks/useLineageSearch';
import { useDetailsPanels } from '@/hooks/useDetailsPanels';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [useLargeDataset, setUseLargeDataset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    
    // Use setTimeout to allow the UI to update with the loading state
    setTimeout(() => {
      const dataToUse = useLargeDataset ? mockLargeLineageData : mockLineageData;
      console.log(`Loading ${dataToUse.nodes.length} nodes and ${dataToUse.edges.length} edges`);
      
      const { flowNodes, flowEdges } = calculateInitialLayout(
        dataToUse.nodes,
        dataToUse.edges
      );
      
      setNodes(flowNodes);
      setEdges(flowEdges);
      
      // Give more time for the layout to stabilize before fitting view
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.4, includeHiddenNodes: false });
        setIsLoading(false);
      }, 300);
    }, 100);
  }, [reactFlowInstance, setEdges, setNodes, useLargeDataset]);

  useEffect(() => {
    initialLayout();
  }, [initialLayout, useLargeDataset]);

  const onConnect = useCallback(
    (params: Connection) => {
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

  const toggleDataset = useCallback(() => {
    setUseLargeDataset(prev => !prev);
  }, []);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            <p className="text-sm text-muted-foreground">
              Loading {useLargeDataset ? 'large' : 'small'} dataset...
            </p>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-border">
        <div className="flex items-center space-x-2">
          <Switch 
            id="dataset-toggle" 
            checked={useLargeDataset} 
            onCheckedChange={toggleDataset} 
          />
          <Label htmlFor="dataset-toggle">Use large dataset ({useLargeDataset ? '200 nodes' : 'small'})</Label>
        </div>
      </div>
      
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
