
import React, { memo, useState } from 'react';
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
  
  const { setEdges } = useReactFlow();
  
  const nodeTypeClass = getNodeTypeClass(data.type);
  
  // Ensure we have columns data
  const columns = data.columns || [];
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setExpanded(!expanded);
  };
  
  const toggleShowAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setShowAllColumns(!showAllColumns);
  };
  
  // Function to toggle incoming lineage connections
  const toggleIncomingLineage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    const newState = !hideIncomingLineage;
    setHideIncomingLineage(newState);
    
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
  };
  
  // Function to toggle outgoing lineage connections
  const toggleOutgoingLineage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    const newState = !hideOutgoingLineage;
    setHideOutgoingLineage(newState);
    
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
  };
  
  return (
    <div 
      className={`shadow-md rounded-lg overflow-visible ${nodeTypeClass} ${selected ? 'ring-2 ring-primary/40' : ''} ${dragging ? 'shadow-lg ring-1 ring-primary/40' : ''}`} 
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
