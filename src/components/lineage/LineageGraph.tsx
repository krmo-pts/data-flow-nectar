
import React, { useCallback, useState, useTransition, useMemo } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  NodePositionChange
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

  // Handle node changes with improved drag detection
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply changes to the local state immediately for smooth UI update
    onNodesChange(changes);
    
    // Find position changes to detect dragging
    const positionChange = changes.find(
      (change): change is NodePositionChange => change.type === 'position'
    );
    
    // If we have a position change, check its dragging status
    if (positionChange) {
      const wasDragging = isDragging;
      const isDraggingNow = !!positionChange.dragging;
      
      if (wasDragging !== isDraggingNow) {
        console.log('Node drag state changed:', {
          nodeId: positionChange.id,
          isDragging: isDraggingNow,
          wasDragging: wasDragging
        });
        setIsDragging(isDraggingNow);
      }
      
      // Only update the main state after drag completes to avoid excessive updates
      if (!positionChange.dragging && positionChange.position) {
        console.log('Finalizing node position after drag:', {
          nodeId: positionChange.id,
          position: positionChange.position
        });
        
        startTransition(() => {
          // Update node positions in the main state
          setNodes(prevNodes => 
            prevNodes.map(node => 
              node.id === positionChange.id 
                ? { ...node, position: positionChange.position || node.position }
                : node
            )
          );
        });
      }
    }
  }, [onNodesChange, setNodes, isDragging]);

  // Handle edge changes - skip during dragging for better performance
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Apply changes to the local state immediately
    onEdgesChange(changes);
    
    // Only update the main state if not dragging
    if (!isDragging) {
      startTransition(() => {
        setEdges(prev => {
          // Only handle removal changes to avoid unnecessary updates
          if (changes.some(change => change.type === 'remove')) {
            return prev.filter(edge => 
              !changes.some(change => 
                change.type === 'remove' && change.id === edge.id
              )
            );
          }
          return prev;
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

  // Add loading overlay during dragging with large datasets
  const showDraggingOverlay = useMemo(() => {
    return isDragging && (datasetSize === 'large' || datasetSize === 'veryLarge') && edges.length > 300;
  }, [isDragging, datasetSize, edges.length]);

  return (
    <div className="w-full h-full relative">
      <LoadingOverlay isVisible={isLoading} datasetSize={datasetSize} />
      
      {showDraggingOverlay && (
        <div className="absolute top-16 right-4 z-50 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-border">
          <div className="text-xs text-muted-foreground">
            Optimizing rendering during drag operation...
          </div>
        </div>
      )}
      
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
