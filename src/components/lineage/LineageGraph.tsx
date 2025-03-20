
import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
  Panel,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { NodeData, EdgeData } from '@/types/lineage';
import BaseNode from './nodes/BaseNode';
import CustomEdge from './edges/CustomEdge';
import NodeDetailsPanel from './NodeDetailsPanel';
import EdgeDetailsPanel from './EdgeDetailsPanel';
import { mockLineageData } from '@/data/mockLineageData';
import { Button } from '@/components/ui/button';
import { Search, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  
  const initialLayout = useCallback(() => {
    // Create a map of node IDs to track dependencies
    const nodeMap = new Map();
    const incomingEdges = new Map();
    const outgoingEdges = new Map();
    
    // Initialize maps
    mockLineageData.nodes.forEach(node => {
      nodeMap.set(node.id, node);
      incomingEdges.set(node.id, []);
      outgoingEdges.set(node.id, []);
    });
    
    // Map connections between nodes
    mockLineageData.edges.forEach(edge => {
      if (outgoingEdges.has(edge.source)) {
        outgoingEdges.get(edge.source).push(edge.target);
      }
      
      if (incomingEdges.has(edge.target)) {
        incomingEdges.get(edge.target).push(edge.source);
      }
    });
    
    // Calculate node levels based on dependencies
    const nodeLevels = new Map();
    const calculateLevel = (nodeId, visited = new Set()) => {
      // Prevent infinite loops with circular dependencies
      if (visited.has(nodeId)) return 0;
      
      visited.add(nodeId);
      
      // If node has no incoming edges, it's a source node (level 0)
      const incoming = incomingEdges.get(nodeId) || [];
      if (incoming.length === 0) return 0;
      
      // Node level is 1 + max level of all its dependencies
      let maxLevel = 0;
      for (const sourceId of incoming) {
        const sourceLevel = nodeLevels.has(sourceId) 
          ? nodeLevels.get(sourceId) 
          : calculateLevel(sourceId, new Set(visited));
        maxLevel = Math.max(maxLevel, sourceLevel);
      }
      
      return maxLevel + 1;
    };
    
    // Calculate levels for all nodes
    mockLineageData.nodes.forEach(node => {
      if (!nodeLevels.has(node.id)) {
        nodeLevels.set(node.id, calculateLevel(node.id));
      }
    });
    
    // Group nodes by their level
    const nodesByLevel = new Map();
    nodeLevels.forEach((level, nodeId) => {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level).push(nodeId);
    });
    
    // Position nodes based on their level
    const levelWidth = 250; // Horizontal spacing between levels
    const nodePositions = {};
    
    // Sort levels for left-to-right layout
    const sortedLevels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
    
    sortedLevels.forEach((level, levelIndex) => {
      const nodesInLevel = nodesByLevel.get(level) || [];
      const levelHeight = nodesInLevel.length * 150; // Total height needed for this level
      const startY = -levelHeight / 2; // Center vertically
      
      nodesInLevel.forEach((nodeId, nodeIndex) => {
        // Position more evenly on the y-axis with some variance to avoid straight lines
        const variance = Math.random() * 40 - 20; // Small random offset for visual interest
        
        nodePositions[nodeId] = {
          x: level * levelWidth,
          y: startY + nodeIndex * 150 + variance, // Space nodes within level
        };
      });
    });
    
    // Create React Flow nodes with positioned data
    const flowNodes = mockLineageData.nodes.map((node) => {
      const position = nodePositions[node.id] || { x: Math.random() * 500, y: Math.random() * 500 };
      
      return {
        id: node.id,
        type: 'default',
        position,
        data: { ...node },
        className: `node-${node.type}`,
      };
    });
    
    // Create edges with marker end and data
    const flowEdges = mockLineageData.edges.map((edge) => {
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge,
        type: 'default',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#64748b',
        },
      };
    });
    
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

  const handleSearch = useCallback(() => {
    if (!searchQuery) {
      // Reset highlight if search is empty
      setNodes((nds) => 
        nds.map((node) => ({
          ...node,
          className: `node-${(node.data as NodeData).type}`,
        }))
      );
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Highlight nodes that match the search query
    setNodes((nds) => 
      nds.map((node) => {
        const data = node.data as NodeData;
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
      })
    );
    
    // Also update edges to show/hide based on connected nodes
    setEdges((eds) => 
      eds.map((edge) => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === edge.target);
        
        const sourceData = sourceNode?.data as NodeData;
        const targetData = targetNode?.data as NodeData;
        
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
      })
    );
  }, [searchQuery, nodes, setEdges, setNodes]);

  const fitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

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
        
        <Panel position="top-left" className="glass-panel p-2 rounded-md flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-8 text-sm"
          />
          <Button size="sm" onClick={handleSearch} className="h-8 px-2">
            <Search className="h-4 w-4" />
          </Button>
        </Panel>
        
        <Panel position="bottom-left" className="glass-panel p-2 rounded-md flex items-center space-x-2">
          <Button size="sm" onClick={() => reactFlowInstance.zoomIn()} className="h-8 w-8 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => reactFlowInstance.zoomOut()} className="h-8 w-8 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={fitView} className="h-8 w-8 p-0">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={resetView} className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Panel>
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
