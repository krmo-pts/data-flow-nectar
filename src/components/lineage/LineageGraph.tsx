
import React, { useCallback, useState, useTransition } from 'react';
import {
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useLineageData } from '@/hooks/useLineageData';
import { useDetailsPanels } from '@/hooks/useDetailsPanels';
import { useDragHandler } from '@/hooks/useDragHandler';
import { useEdgeHandler } from '@/hooks/useEdgeHandler';
import { useLineageSearch } from '@/hooks/useLineageSearch';

import NodeDetailsPanel from './NodeDetailsPanel';
import EdgeDetailsPanel from './EdgeDetailsPanel';
import DatasetToggle from './DatasetToggle';
import LoadingOverlay from './LoadingOverlay';
import FlowComponent from './FlowComponent';
import DraggingIndicator from './DraggingIndicator';

const LineageGraph: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    datasetSize,
    isLoading,
    setDatasetSize,
    resetView,
    setFocusNode
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

  // Use the drag handler hook
  const { isDragging, handleNodesChange } = useDragHandler({
    setNodes,
    onNodesChange
  });

  // Use the edge handler hook with setNodes passed to enable connected node removal
  const { handleEdgesChange, handleConnect } = useEdgeHandler({
    setEdges,
    onEdgesChange,
    isDragging,
    setNodes // Pass setNodes to enable removing connected nodes when edges are deleted
  });

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
  
  // Use our new search hook
  const { handleSearch } = useLineageSearch(nodes, setNodes, setEdges);
  
  const handleSearchQuery = useCallback(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const handleResetView = useCallback(() => {
    resetView();
    setSearchQuery('');
    resetPanels();
  }, [resetView, resetPanels]);

  // New function to set focus on a specific node
  const handleSetFocus = useCallback((nodeId: string) => {
    setFocusNode(nodeId);
  }, [setFocusNode]);

  // Determine if we should show the dragging overlay
  const showDraggingOverlay = isDragging && 
    (datasetSize === 'large' || datasetSize === 'veryLarge') && 
    edges.length > 300;

  return (
    <div className="w-full h-full relative">
      <LoadingOverlay isVisible={isLoading} datasetSize={datasetSize} />
      <DraggingIndicator showOverlay={showDraggingOverlay} />
      
      <DatasetToggle 
        datasetSize={datasetSize} 
        setDatasetSize={setDatasetSize} 
        isLoading={isLoading || isPending}
      />
      
      <ReactFlowProvider>
        <FlowComponent
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          handleNodeClick={handleNodeClick}
          handleEdgeClick={handleEdgeClick}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearchQuery}
          resetView={handleResetView}
          resetPanels={resetPanels}
          isDragging={isDragging}
          setNodes={setNodes}
          setEdges={setEdges}
        />
      </ReactFlowProvider>
      
      {/* Only render panels when they're needed */}
      <NodeDetailsPanel 
        node={selectedNode} 
        onClose={handleCloseNodePanel} 
        isOpen={isNodePanelOpen} 
        onSetFocus={handleSetFocus}
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
