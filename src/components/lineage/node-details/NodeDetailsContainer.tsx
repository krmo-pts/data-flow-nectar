
import React from 'react';
import { NodeData } from '@/types/lineage';
import NodeDetailsHeader from './NodeDetailsHeader';
import NodeDetailsContent from './NodeDetailsContent';

interface NodeDetailsContainerProps {
  node: NodeData;
  onClose: () => void;
  onSetFocus?: (nodeId: string) => void;
  isAnalyzing?: boolean;
}

const NodeDetailsContainer: React.FC<NodeDetailsContainerProps> = ({
  node,
  onClose,
  onSetFocus,
  isAnalyzing = false
}) => {
  return (
    <div className="h-full flex flex-col">
      <NodeDetailsHeader 
        node={node} 
        onClose={onClose} 
        onSetFocus={onSetFocus}
        isAnalyzing={isAnalyzing}
      />
      <NodeDetailsContent node={node} />
    </div>
  );
};

export default NodeDetailsContainer;
