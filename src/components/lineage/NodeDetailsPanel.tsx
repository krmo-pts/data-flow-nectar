
import React, { memo } from 'react';
import { NodeData } from '@/types/lineage';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import NodeDetailsHeader from './node-details/NodeDetailsHeader';
import NodeDetailsContent from './node-details/NodeDetailsContent';

interface NodeDetailsPanelProps {
  node: NodeData | null;
  onClose: () => void;
  isOpen: boolean;
  onSetFocus?: (nodeId: string) => void;
  isAnalyzing?: boolean;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ 
  node, 
  onClose,
  isOpen,
  onSetFocus,
  isAnalyzing = false
}) => {
  if (!node) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-[400px] p-0 max-w-[min(420px,_calc(100vw_-_40px))] border-border h-[calc(100vh-32px)] my-4 mr-4 rounded-md overflow-hidden"
        onInteractOutside={onClose}
        hideCloseButton={true}
      >
        <div className="h-full flex flex-col">
          <NodeDetailsHeader 
            node={node} 
            onClose={onClose} 
            onSetFocus={onSetFocus}
            isAnalyzing={isAnalyzing}
          />
          <NodeDetailsContent node={node} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default memo(NodeDetailsPanel);
