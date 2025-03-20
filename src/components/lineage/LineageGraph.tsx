
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

  // Use the drag handler hook
  const { isDragging, handleNodesChange } = useDragHandler({
    setNodes,
    onNodesChange
  });

  // Use the edge handler hook
  const { handleEdgesChange, handleConnect } = useEdgeHandler({
    setEdges,
    onEdgesChange,
    isDragging
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
  
  const handleSearchQuery = useCallback(() => {
    setNodes(prevNodes => {
      // Use the search logic
      const query = searchQuery.toLowerCase();
      if (!query) {
        return prevNodes.map((node) => ({
          ...node,
          className: `node-${node.data.type}`,
        }));
      }
      
      return prevNodes.map((node) => {
        const data = node.data;
        const matches = 
          data.name.toLowerCase().includes(query) ||
          data.path.toLowerCase().includes(query) ||
          data.platform.toLowerCase().includes(query) ||
          data.type.toLowerCase().includes(query) ||
          data.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          false;
        
        return {
          ...node,
          className: matches 
            ? `node-${data.type} border-primary shadow-md ring-2 ring-primary/20` 
            : `node-${data.type} opacity-40`,
        };
      });
    });
    
    setEdges(prevEdges => {
      const query = searchQuery.toLowerCase();
      if (!query) return prevEdges;
      
      return prevEdges.map((edge) => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === edge.target);
        
        const sourceData = sourceNode?.data;
        const targetData = targetNode?.data;
        
        const sourceMatches = 
          sourceData?.name.toLowerCase().includes(query) ||
          sourceData?.path.toLowerCase().includes(query) ||
          sourceData?.platform.toLowerCase().includes(query) ||
          sourceData?.type.toLowerCase().includes(query) ||
          sourceData?.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          false;
          
        const targetMatches = 
          targetData?.name.toLowerCase().includes(query) ||
          targetData?.path.toLowerCase().includes(query) ||
          targetData?.platform.toLowerCase().includes(query) ||
          targetData?.type.toLowerCase().includes(query) ||
          targetData?.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          false;
        
        return {
          ...edge,
          className: sourceMatches || targetMatches ? '' : 'opacity-20',
        };
      });
    });
  }, [searchQuery, nodes, setNodes, setEdges]);

  const handleResetView = useCallback(() => {
    resetView();
    setSearchQuery('');
    resetPanels();
  }, [resetView, resetPanels]);

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
          isDragging={isDragging}
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
