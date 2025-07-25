
import React, { useState, useEffect } from 'react';
import { X, Target, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NodeData } from '@/types/lineage';
import { getTypeColor, getPlatformColor } from './badgeUtils';
import ImpactBadge from './ImpactBadge';

interface NodeDetailsHeaderProps {
  node: NodeData;
  onClose: () => void;
  onSetFocus?: (nodeId: string) => void;
  isAnalyzing?: boolean;
}

const NodeDetailsHeader: React.FC<NodeDetailsHeaderProps> = ({ 
  node, 
  onClose, 
  onSetFocus,
  isAnalyzing = false
}) => {
  // Add local state to track focused state immediately
  const [isLocalFocus, setIsLocalFocus] = useState(node.isFocus);

  // Update local state when node props change
  useEffect(() => {
    setIsLocalFocus(node.isFocus);
  }, [node.isFocus]);

  const handleSetFocus = () => {
    if (onSetFocus) {
      // Toggle focus state
      const newFocusState = !isLocalFocus;
      setIsLocalFocus(newFocusState);
      onSetFocus(node.id);
    }
  };

  return (
    <div className="p-6 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Node Details</h2>
        
        {/* Focus button placed between title and close button */}
        <div className="flex items-center gap-2">
          {onSetFocus && (
            <Button 
              variant={isLocalFocus ? "default" : "outline"}
              size="sm" 
              onClick={handleSetFocus}
              className="flex items-center gap-1"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : isLocalFocus ? (
                <>
                  <Target size={14} />
                  <span>Focused</span>
                </>
              ) : (
                <>
                  <Target size={14} />
                  <span>Set as focus</span>
                </>
              )}
            </Button>
          )}
          
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          {/* Node name now has full width of the panel */}
          <h3 className="text-2xl font-bold text-foreground mb-3">{node.name}</h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={getTypeColor(node.type)}>
              {node.type}
            </Badge>
            <Badge variant="outline" className={getPlatformColor(node.platform)}>
              {node.platform}
            </Badge>
            <ImpactBadge impactType={node.impactType} />
            {node.impactDistance !== undefined && node.impactDistance > 0 && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                {node.impactDistance} {node.impactDistance === 1 ? 'step' : 'steps'} from focus
              </Badge>
            )}
          </div>
          {node.description && (
            <p className="text-sm text-muted-foreground">{node.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsHeader;
