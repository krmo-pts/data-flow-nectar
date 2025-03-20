
import React, { memo, useRef, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import { NodeData } from '../../../types/lineage';
import { getNodeTypeClass } from './NodeUtils';
import NodeHeader from './NodeHeader';
import NodeContent from './NodeContent';
import { useNodeExpansion } from '@/hooks/useNodeExpansion';
import { useLineageVisibility } from '@/hooks/useLineageVisibility';

const BaseNode = ({ data, selected, dragging, id }: NodeProps<NodeData>) => {
  const { 
    expanded, 
    showAllColumns, 
    toggleExpand, 
    toggleShowAll,
    setNodeElement
  } = useNodeExpansion(id);
  
  const { 
    hideIncomingLineage, 
    hideOutgoingLineage,
    toggleIncomingLineage,
    toggleOutgoingLineage,
    isProcessingLineage
  } = useLineageVisibility({ nodeId: data.id });
  
  const nodeTypeClass = getNodeTypeClass(data.type);
  
  // Ensure we have columns data
  const columns = data.columns || [];
  
  // Add focus node class if this is the focus node
  const focusNodeClass = data.isFocus ? 'focus-node' : '';
  
  // Create a ref for the node container
  const nodeElementRef = useRef<HTMLDivElement>(null);
  
  // Pass the node element to the hook
  useEffect(() => {
    if (nodeElementRef.current) {
      setNodeElement(nodeElementRef.current);
    }
  }, [setNodeElement]);
  
  return (
    <div 
      ref={nodeElementRef}
      className={`shadow-md rounded-lg overflow-visible border border-border ${nodeTypeClass} ${selected ? 'ring-2 ring-primary/40' : ''} ${dragging ? 'shadow-lg ring-1 ring-primary/40' : ''} ${focusNodeClass} node-container`} 
      style={{ 
        minWidth: '240px', 
        cursor: 'move',
        transformOrigin: 'top center' // This ensures expansions/collapses happen from the top
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
