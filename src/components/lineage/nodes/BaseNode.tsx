
import React, { memo, useState, useCallback } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import { NodeData } from '../../../types/lineage';
import { getNodeTypeClass } from './NodeUtils';
import NodeHeader from './NodeHeader';
import NodeContent from './NodeContent';
import { useToast } from '@/hooks/use-toast';

const BaseNode = ({ data, selected, dragging }: NodeProps<NodeData>) => {
  const [expanded, setExpanded] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [hideIncomingLineage, setHideIncomingLineage] = useState(false);
  const [hideOutgoingLineage, setHideOutgoingLineage] = useState(false);
  
  const { setEdges, setNodes, getEdges, getNodes } = useReactFlow();
  const { toast } = useToast();
  
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
  
  // Function to toggle incoming lineage connections
  const toggleIncomingLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setHideIncomingLineage(prev => {
      const newState = !prev;
      
      // Update edges visibility based on toggle state
      setEdges(edges => {
        return edges.map(edge => {
          if (edge.target === data.id) {
            return {
              ...edge,
              hidden: newState
            };
          }
          return edge;
        });
      });
      
      return newState;
    });
  }, [data.id, setEdges]);
  
  // Function to toggle outgoing lineage connections
  const toggleOutgoingLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setHideOutgoingLineage(prev => {
      const newState = !prev;
      
      // Update edges visibility based on toggle state
      setEdges(edges => {
        return edges.map(edge => {
          if (edge.source === data.id) {
            return {
              ...edge,
              hidden: newState
            };
          }
          return edge;
        });
      });
      
      return newState;
    });
  }, [data.id, setEdges]);
  
  // Function to expand upstream lineage
  const expandUpstreamLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection
    
    // Toggle expanded state
    setNodes(nodes => {
      return nodes.map(node => {
        if (node.id === data.id) {
          const newExpandedState = !(node.data.expandedUpstream || false);
          
          // Update upstream edges visibility
          setEdges(edges => {
            const upstreamNodeIds = new Set<string>();
            
            // First pass: identify all upstream nodes
            edges.forEach(edge => {
              if (edge.target === data.id) {
                upstreamNodeIds.add(edge.source);
              }
            });
            
            // Second pass: update the edges
            return edges.map(edge => {
              // If this edge is incoming to an upstream node
              if (upstreamNodeIds.has(edge.target) && edge.target !== data.id) {
                return {
                  ...edge,
                  hidden: !newExpandedState
                };
              }
              return edge;
            });
          });
          
          // Show a toast notification
          toast({
            title: newExpandedState ? "Expanded Upstream" : "Collapsed Upstream",
            description: `${newExpandedState ? "Showing" : "Hiding"} upstream lineage for ${data.name}`,
          });
          
          return {
            ...node,
            data: {
              ...node.data,
              expandedUpstream: newExpandedState
            }
          };
        }
        return node;
      });
    });
  }, [data.id, data.name, setNodes, setEdges, toast]);
  
  // Function to expand downstream lineage
  const expandDownstreamLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection
    
    // Toggle expanded state
    setNodes(nodes => {
      return nodes.map(node => {
        if (node.id === data.id) {
          const newExpandedState = !(node.data.expandedDownstream || false);
          
          // Update downstream edges visibility
          setEdges(edges => {
            const downstreamNodeIds = new Set<string>();
            
            // First pass: identify all downstream nodes
            edges.forEach(edge => {
              if (edge.source === data.id) {
                downstreamNodeIds.add(edge.target);
              }
            });
            
            // Second pass: update the edges
            return edges.map(edge => {
              // If this edge is outgoing from a downstream node
              if (downstreamNodeIds.has(edge.source) && edge.source !== data.id) {
                return {
                  ...edge,
                  hidden: !newExpandedState
                };
              }
              return edge;
            });
          });
          
          // Show a toast notification
          toast({
            title: newExpandedState ? "Expanded Downstream" : "Collapsed Downstream",
            description: `${newExpandedState ? "Showing" : "Hiding"} downstream lineage for ${data.name}`,
          });
          
          return {
            ...node,
            data: {
              ...node.data,
              expandedDownstream: newExpandedState
            }
          };
        }
        return node;
      });
    });
  }, [data.id, data.name, setNodes, setEdges, toast]);
  
  // Add focus node class if this is the focus node
  const focusNodeClass = data.isFocus ? 'focus-node' : '';
  
  return (
    <div 
      className={`shadow-md rounded-lg overflow-visible ${nodeTypeClass} ${selected ? 'ring-2 ring-primary/40' : ''} ${dragging ? 'shadow-lg ring-1 ring-primary/40' : ''} ${focusNodeClass}`} 
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
        expandUpstreamLineage={expandUpstreamLineage}
        expandDownstreamLineage={expandDownstreamLineage}
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
