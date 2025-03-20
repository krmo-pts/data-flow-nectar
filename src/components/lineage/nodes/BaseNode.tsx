
import React, { memo, useState, useCallback, useEffect } from 'react';
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
  const [isProcessingLineage, setIsProcessingLineage] = useState(false);
  
  const { setEdges, setNodes, getNodes, getEdges } = useReactFlow();
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
  
  // Optimized function to trace and toggle nodes with chunking for large graphs
  const traceAndToggleNodes = useCallback((
    nodeId: string, 
    direction: 'incoming' | 'outgoing', 
    shouldHide: boolean
  ) => {
    setIsProcessingLineage(true);
    
    // Get all edges and nodes
    const edges = getEdges();
    const nodes = getNodes();
    
    // For extremely large graphs, implement chunking
    const isLargeGraph = edges.length > 300 || nodes.length > 150;
    
    // Start with collecting affected node and edge IDs
    const processInitialBatch = () => {
      const visitedNodeIds = new Set<string>([nodeId]);
      const affectedNodeIds = new Set<string>();
      const affectedEdgeIds = new Set<string>();
      const nodesToProcess = new Set<string>();
      
      // Initial batch - find direct connections only
      const connectedEdges = edges.filter(edge => 
        direction === 'incoming' ? edge.target === nodeId : edge.source === nodeId
      );
      
      for (const edge of connectedEdges) {
        affectedEdgeIds.add(edge.id);
        
        // Get the connected node id
        const connectedNodeId = direction === 'incoming' ? edge.source : edge.target;
        affectedNodeIds.add(connectedNodeId);
        
        // Add to queue for further processing if this is a large graph
        if (!visitedNodeIds.has(connectedNodeId)) {
          nodesToProcess.add(connectedNodeId);
        }
      }
      
      // Apply immediate changes for direct connections
      applyChanges(affectedNodeIds, affectedEdgeIds);
      
      // If it's a large graph, continue processing in chunks
      if (isLargeGraph && nodesToProcess.size > 0) {
        // Show a toast for large graphs
        toast({
          title: shouldHide ? "Hiding lineage..." : "Showing lineage...",
          description: `Processing ${direction === 'incoming' ? 'upstream' : 'downstream'} connections in batches.`,
          duration: 3000,
        });
        
        // Continue with the rest in chunks
        processInChunks(Array.from(nodesToProcess), visitedNodeIds, new Set(affectedNodeIds), new Set(affectedEdgeIds));
      } else {
        setIsProcessingLineage(false);
      }
    };
    
    // Process remaining nodes in chunks to avoid UI freeze
    const processInChunks = (
      remainingNodes: string[],
      visitedNodeIds: Set<string>,
      affectedNodeIds: Set<string>,
      affectedEdgeIds: Set<string>,
      depth: number = 1,
      maxDepth: number = 5
    ) => {
      // Stop recursion when we reach max depth or have no more nodes
      if (depth > maxDepth || remainingNodes.length === 0) {
        applyChanges(affectedNodeIds, affectedEdgeIds);
        setIsProcessingLineage(false);
        return;
      }
      
      // Process a chunk of nodes (limit to 20 nodes per chunk)
      const chunkSize = 20;
      const currentChunk = remainingNodes.slice(0, chunkSize);
      const newNodesToProcess = new Set<string>();
      
      // Process current chunk
      for (const currentNodeId of currentChunk) {
        if (visitedNodeIds.has(currentNodeId)) continue;
        visitedNodeIds.add(currentNodeId);
        
        const connectedEdges = edges.filter(edge => 
          direction === 'incoming' ? edge.target === currentNodeId : edge.source === currentNodeId
        );
        
        for (const edge of connectedEdges) {
          affectedEdgeIds.add(edge.id);
          
          // Get the connected node id
          const connectedNodeId = direction === 'incoming' ? edge.source : edge.target;
          affectedNodeIds.add(connectedNodeId);
          
          // Queue for next chunk if not already visited
          if (!visitedNodeIds.has(connectedNodeId)) {
            newNodesToProcess.add(connectedNodeId);
          }
        }
      }
      
      // Apply current chunk's changes
      applyChanges(affectedNodeIds, affectedEdgeIds);
      
      // Prepare the next chunk and continue
      const nextRemainingNodes = [
        ...remainingNodes.slice(chunkSize), 
        ...Array.from(newNodesToProcess)
      ];
      
      // Continue with next chunk after a small delay
      if (nextRemainingNodes.length > 0 && depth < maxDepth) {
        setTimeout(() => {
          processInChunks(
            nextRemainingNodes,
            visitedNodeIds,
            affectedNodeIds,
            affectedEdgeIds,
            depth + 1,
            maxDepth
          );
        }, 50);
      } else {
        setIsProcessingLineage(false);
      }
    };
    
    // Apply changes to nodes and edges
    const applyChanges = (affectedNodeIds: Set<string>, affectedEdgeIds: Set<string>) => {
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
    };
    
    // Start processing
    processInitialBatch();
  }, [getEdges, getNodes, setEdges, setNodes, toast]);
  
  // Function to toggle incoming lineage connections
  const toggleIncomingLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    
    // If already processing, don't allow another toggle
    if (isProcessingLineage) return;
    
    setHideIncomingLineage(prev => {
      const shouldHide = !prev;
      traceAndToggleNodes(data.id, 'incoming', shouldHide);
      return shouldHide;
    });
  }, [data.id, isProcessingLineage, traceAndToggleNodes]);
  
  // Function to toggle outgoing lineage connections
  const toggleOutgoingLineage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    
    // If already processing, don't allow another toggle
    if (isProcessingLineage) return;
    
    setHideOutgoingLineage(prev => {
      const shouldHide = !prev;
      traceAndToggleNodes(data.id, 'outgoing', shouldHide);
      return shouldHide;
    });
  }, [data.id, isProcessingLineage, traceAndToggleNodes]);
  
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
        isProcessingLineage={isProcessingLineage}
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
