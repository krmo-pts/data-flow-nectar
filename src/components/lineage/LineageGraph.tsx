
import React, { useCallback, useState, useTransition, useMemo } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  
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

  // More efficient node position update with drag handling
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply changes to the local state immediately for smooth UI update
    onNodesChange(changes);
    
    // Detect drag operations by checking for position changes
    const positionChange = changes.find(change => 
      change.type === 'position'
    );
    
    // If we have a position change, check its dragging status via type assertion
    if (positionChange && positionChange.type === 'position') {
      // Update dragging state to optimize rendering during drag
      setIsDragging(positionChange.dragging === true);
      
      // Only update the main state after drag completes to avoid performance issues
      if (!positionChange.dragging) {
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
      }
    }
  }, [onNodesChange, setNodes]);

  // More efficient edge updates - skip during dragging for better performance
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Apply changes to the local state immediately
    onEdgesChange(changes);
    
    // Only update the main state if not dragging
    if (!isDragging) {
      startTransition(() => {
        setEdges(prev => {
          const nextEdges = [...prev];
          changes.forEach(change => {
            if (change.type === 'remove') {
              const index = nextEdges.findIndex(edge => edge.id === change.id);
              if (index !== -1) {
                nextEdges.splice(index, 1);
              }
            }
          });
          return nextEdges;
        });
      });
    }
  }, [onEdgesChange, setEdges, isDragging]);

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
      <LoadingOverlay isVisible={isLoading} datasetSize={datasetSize} />
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
          onConnect={onConnect}
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
