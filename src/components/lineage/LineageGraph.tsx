
import React, { useCallback, useState, useTransition } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  ReactFlowProvider,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useLineageSearch } from '@/hooks/useLineageSearch';
import { useDetailsPanels } from '@/hooks/useDetailsPanels';
import { useLineageData } from '@/hooks/useLineageData';

import NodeDetailsPanel from './NodeDetailsPanel';
import EdgeDetailsPanel from './EdgeDetailsPanel';
import DatasetToggle from './DatasetToggle';
import LoadingOverlay from './LoadingOverlay';
import FlowComponent from './FlowComponent';

const LineageGraph: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    useLargeDataset,
    isLoading,
    toggleDataset,
    resetView
  } = useLineageData();
  
  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges);
  
  // Update the state when nodes or edges change
  React.useEffect(() => {
    setNodesState(nodes);
  }, [nodes, setNodesState]);
  
  React.useEffect(() => {
    setEdgesState(edges);
  }, [edges, setEdgesState]);

  // More efficient node position update
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply changes to the local state immediately for smooth UI update
    onNodesChange(changes);
    
    // Use transition to update the main state without blocking the UI
    startTransition(() => {
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          setNodes(prevNodes => 
            prevNodes.map(node => 
              node.id === change.id 
                ? { ...node, position: change.position || node.position }
                : node
            )
          );
        }
      });
    });
  }, [onNodesChange, setNodes]);

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

  const handleResetView = useCallback(() => {
    resetView();
    setSearchQuery('');
    resetPanels();
  }, [resetView, resetPanels]);

  return (
    <div className="w-full h-full relative">
      <LoadingOverlay isVisible={isLoading} useLargeDataset={useLargeDataset} />
      <DatasetToggle 
        useLargeDataset={useLargeDataset} 
        toggleDataset={toggleDataset} 
        isLoading={isLoading || isPending}
      />
      
      <ReactFlowProvider>
        <FlowComponent
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          handleNodeClick={handleNodeClick}
          handleEdgeClick={handleEdgeClick}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearchQuery}
          resetView={handleResetView}
        />
      </ReactFlowProvider>
      
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
