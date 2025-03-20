
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
  Node,
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
import { toast } from '@/components/ui/use-toast';

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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());

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
    
    // Add expansion handlers to node data
    const nodesWithHandlers = flowNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onExpandUpstream: handleExpandUpstream,
        onExpandDownstream: handleExpandDownstream,
      }
    }));
    
    setNodes(nodesWithHandlers);
    setEdges(flowEdges);
    
    // Give more time for the layout to stabilize before fitting view
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.4, includeHiddenNodes: false });
    }, 300);
  }, [reactFlowInstance, setEdges, setNodes]);

  useEffect(() => {
    initialLayout();
  }, [initialLayout]);

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
    setExpandedNodes(new Set());
    setHiddenNodes(new Set());
  }, [initialLayout, resetPanels]);

  // Function to find connected nodes in the upstream direction
  const findUpstreamNodes = useCallback((nodeId: string): string[] => {
    const upstreamNodes: string[] = [];
    edges.forEach(edge => {
      if (edge.target === nodeId) {
        upstreamNodes.push(edge.source);
      }
    });
    return upstreamNodes;
  }, [edges]);

  // Function to find connected nodes in the downstream direction
  const findDownstreamNodes = useCallback((nodeId: string): string[] => {
    const downstreamNodes: string[] = [];
    edges.forEach(edge => {
      if (edge.source === nodeId) {
        downstreamNodes.push(edge.target);
      }
    });
    return downstreamNodes;
  }, [edges]);

  // Handler for expanding upstream nodes
  const handleExpandUpstream = useCallback((nodeId: string) => {
    const upstreamNodeIds = findUpstreamNodes(nodeId);
    
    if (upstreamNodeIds.length === 0) {
      toast({
        title: "No upstream nodes",
        description: "This node has no upstream dependencies.",
        duration: 3000,
      });
      return;
    }
    
    const newHiddenNodes = new Set(hiddenNodes);
    const newExpandedNodes = new Set(expandedNodes);
    
    // If node is already expanded, collapse it and hide its upstream nodes
    if (expandedNodes.has(`${nodeId}-upstream`)) {
      newExpandedNodes.delete(`${nodeId}-upstream`);
      
      // Hide upstream nodes if they're not connected to other visible nodes
      upstreamNodeIds.forEach(upstreamId => {
        // Check if this upstream node is connected to any other visible node
        const isConnectedToOtherVisible = edges.some(edge => 
          (edge.source === upstreamId || edge.target === upstreamId) && 
          edge.source !== nodeId && 
          edge.target !== nodeId &&
          !hiddenNodes.has(edge.source) && 
          !hiddenNodes.has(edge.target)
        );
        
        if (!isConnectedToOtherVisible) {
          newHiddenNodes.add(upstreamId);
        }
      });
      
      setHiddenNodes(newHiddenNodes);
      setExpandedNodes(newExpandedNodes);
      
      // Update the visibility of nodes
      setNodes(nds => nds.map(node => ({
        ...node,
        hidden: newHiddenNodes.has(node.id)
      })));
      
      toast({
        title: "Collapsed upstream",
        description: "Upstream nodes have been hidden.",
        duration: 3000,
      });
    } else {
      // Expand the node to show upstream nodes
      newExpandedNodes.add(`${nodeId}-upstream`);
      
      // Show all upstream nodes
      upstreamNodeIds.forEach(upstreamId => {
        newHiddenNodes.delete(upstreamId);
      });
      
      setHiddenNodes(newHiddenNodes);
      setExpandedNodes(newExpandedNodes);
      
      // Update the visibility of nodes
      setNodes(nds => nds.map(node => ({
        ...node,
        hidden: newHiddenNodes.has(node.id)
      })));
      
      toast({
        title: "Expanded upstream",
        description: `Showing ${upstreamNodeIds.length} upstream node(s).`,
        duration: 3000,
      });
    }
    
    // Fit view to show all visible nodes
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.4, includeHiddenNodes: false });
    }, 300);
  }, [edges, expandedNodes, findUpstreamNodes, hiddenNodes, reactFlowInstance, setNodes]);

  // Handler for expanding downstream nodes
  const handleExpandDownstream = useCallback((nodeId: string) => {
    const downstreamNodeIds = findDownstreamNodes(nodeId);
    
    if (downstreamNodeIds.length === 0) {
      toast({
        title: "No downstream nodes",
        description: "This node has no downstream dependencies.",
        duration: 3000,
      });
      return;
    }
    
    const newHiddenNodes = new Set(hiddenNodes);
    const newExpandedNodes = new Set(expandedNodes);
    
    // If node is already expanded, collapse it and hide its downstream nodes
    if (expandedNodes.has(`${nodeId}-downstream`)) {
      newExpandedNodes.delete(`${nodeId}-downstream`);
      
      // Hide downstream nodes if they're not connected to other visible nodes
      downstreamNodeIds.forEach(downstreamId => {
        // Check if this downstream node is connected to any other visible node
        const isConnectedToOtherVisible = edges.some(edge => 
          (edge.source === downstreamId || edge.target === downstreamId) && 
          edge.source !== nodeId && 
          edge.target !== nodeId &&
          !hiddenNodes.has(edge.source) && 
          !hiddenNodes.has(edge.target)
        );
        
        if (!isConnectedToOtherVisible) {
          newHiddenNodes.add(downstreamId);
        }
      });
      
      setHiddenNodes(newHiddenNodes);
      setExpandedNodes(newExpandedNodes);
      
      // Update the visibility of nodes
      setNodes(nds => nds.map(node => ({
        ...node,
        hidden: newHiddenNodes.has(node.id)
      })));
      
      toast({
        title: "Collapsed downstream",
        description: "Downstream nodes have been hidden.",
        duration: 3000,
      });
    } else {
      // Expand the node to show downstream nodes
      newExpandedNodes.add(`${nodeId}-downstream`);
      
      // Show all downstream nodes
      downstreamNodeIds.forEach(downstreamId => {
        newHiddenNodes.delete(downstreamId);
      });
      
      setHiddenNodes(newHiddenNodes);
      setExpandedNodes(newExpandedNodes);
      
      // Update the visibility of nodes
      setNodes(nds => nds.map(node => ({
        ...node,
        hidden: newHiddenNodes.has(node.id)
      })));
      
      toast({
        title: "Expanded downstream",
        description: `Showing ${downstreamNodeIds.length} downstream node(s).`,
        duration: 3000,
      });
    }
    
    // Fit view to show all visible nodes
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.4, includeHiddenNodes: false });
    }, 300);
  }, [edges, expandedNodes, findDownstreamNodes, hiddenNodes, reactFlowInstance, setNodes]);

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
