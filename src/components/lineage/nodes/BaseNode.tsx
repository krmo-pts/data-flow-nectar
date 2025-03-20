
import React, { memo, useState, useCallback } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import { NodeData } from '../../../types/lineage';
import { getNodeTypeClass } from './NodeUtils';
import NodeHeader from './NodeHeader';
import NodeContent from './NodeContent';

const BaseNode = ({ data, selected, dragging }: NodeProps<NodeData>) => {
  const [expanded, setExpanded] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [hideIncomingLineage, setHideIncomingLineage] = useState(false);
  const [hideOutgoingLineage, setHideOutgoingLineage] = useState(false);
  
  const { setEdges, setNodes, getNodes, getEdges } = useReactFlow();
  
  const nodeTypeClass = getNodeTypeClass(data.type);
  
  // Ensure we have columns data
  const columns = data.columns || [];
  
  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setExpanded(prev => !prev);
  }, []);
  
  const toggleShowAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setShowAllColumns(prev => !prev);
  }, []);
  
  // Helper function to trace and hide/show nodes recursively in a direction
  const traceAndToggleNodes = useCallback((
    nodeId: string, 
    direction: 'incoming' | 'outgoing', 
    shouldHide: boolean,
    visitedNodeIds: Set<string> = new Set(),
    affectedNodeIds: Set<string> = new Set(),
    affectedEdgeIds: Set<string> = new Set()
  ) => {
    // Prevent infinite recursion
    if (visitedNodeIds.has(nodeId)) return { affectedNodeIds, affectedEdgeIds };
    visitedNodeIds.add(nodeId);
    
    // Find all edges connected to this node in the specified direction
    const edges = getEdges();
    const connectedEdges = edges.filter(edge => 
      direction === 'incoming' ? edge.target === nodeId : edge.source === nodeId
    );
    
    // Process each connected edge
    for (const edge of connectedEdges) {
      affectedEdgeIds.add(edge.id);
      
      // Get the connected node id
      const connectedNodeId = direction === 'incoming' ? edge.source : edge.target;
      affectedNodeIds.add(connectedNodeId);
      
      // Recursively trace further nodes
      traceAndToggleNodes(
        connectedNodeId, 
        direction, 
        shouldHide, 
        visitedNodeIds,
        affectedNodeIds,
        affectedEdgeIds
      );
    }
    
    return { affectedNodeIds, affectedEdgeIds };
  }, [getEdges]);
  
  // Function to toggle incoming lineage connections
  const toggleIncomingLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    
    setHideIncomingLineage(prev => {
      const shouldHide = !prev;
      
      // Get affected nodes and edges by tracing upstream
      const { affectedNodeIds, affectedEdgeIds } = traceAndToggleNodes(
        data.id,
        'incoming',
        shouldHide
      );
      
      // Update edges visibility
      setEdges(edges => {
        return edges.map(edge => {
          if (affectedEdgeIds.has(edge.id)) {
            return {
              ...edge,
              hidden: shouldHide
            };
          }
          return edge;
        });
      });
      
      // Update nodes visibility
      setNodes(nodes => {
        return nodes.map(node => {
          if (affectedNodeIds.has(node.id)) {
            return {
              ...node,
              hidden: shouldHide
            };
          }
          return node;
        });
      });
      
      return shouldHide;
    });
  }, [data.id, setEdges, setNodes, traceAndToggleNodes]);
  
  // Function to toggle outgoing lineage connections
  const toggleOutgoingLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    
    setHideOutgoingLineage(prev => {
      const shouldHide = !prev;
      
      // Get affected nodes and edges by tracing downstream
      const { affectedNodeIds, affectedEdgeIds } = traceAndToggleNodes(
        data.id,
        'outgoing',
        shouldHide
      );
      
      // Update edges visibility
      setEdges(edges => {
        return edges.map(edge => {
          if (affectedEdgeIds.has(edge.id)) {
            return {
              ...edge,
              hidden: shouldHide
            };
          }
          return edge;
        });
      });
      
      // Update nodes visibility
      setNodes(nodes => {
        return nodes.map(node => {
          if (affectedNodeIds.has(node.id)) {
            return {
              ...node,
              hidden: shouldHide
            };
          }
          return node;
        });
      });
      
      return shouldHide;
    });
  }, [data.id, setEdges, setNodes, traceAndToggleNodes]);
  
  // Add focus node class if this is the focus node
  const focusNodeClass = data.isFocus ? 'focus-node' : '';
  
  return (
    <div 
      className={`shadow-md rounded-lg overflow-visible border border-border ${nodeTypeClass} ${selected ? 'ring-2 ring-primary/40' : ''} ${dragging ? 'shadow-lg ring-1 ring-primary/40' : ''} ${focusNodeClass}`} 
      style={{ 
        minWidth: '240px', 
        cursor: 'move'
      }}
    >
      <NodeHeader 
        data={data}
        expanded={expanded}
        toggleExpand={toggleExpand}
        hideIncomingLineage={hideIncomingLineage}
        hideOutgoingLineage={hideOutgoingLineage}
        toggleIncomingLineage={toggleIncomingLineage}
        toggleOutgoingLineage={toggleOutgoingLineage}
      />
      
      <NodeContent 
        expanded={expanded}
        columns={columns}
        showAllColumns={showAllColumns}
        toggleShowAll={toggleShowAll}
      />
    </div>
  );
};

export default memo(BaseNode);
