
import React, { memo } from 'react';
import { EdgeData } from '@/types/lineage';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EdgeDetailsPanelProps {
  edge: EdgeData | null;
  onClose: () => void;
  isOpen: boolean;
}

const EdgeDetailsPanel: React.FC<EdgeDetailsPanelProps> = ({ 
  edge, 
  onClose,
  isOpen 
}) => {
  if (!isOpen || !edge) return null;

  const getTransformationTypeColor = (type?: string) => {
    if (!type) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (type.toLowerCase()) {
      case 'extract':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'transform':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'load':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'join':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'read':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`edge-details-panel ${isOpen ? 'open' : 'closed'} glass-panel`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Edge Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-2 text-foreground">
            {edge.label || 'Connection'}
          </h3>
          
          {edge.transformationType && (
            <Badge variant="outline" className={getTransformationTypeColor(edge.transformationType)}>
              {edge.transformationType}
            </Badge>
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Source</h4>
          <code className="block p-2 bg-secondary rounded text-xs overflow-x-auto">
            {edge.source}
          </code>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Target</h4>
          <code className="block p-2 bg-secondary rounded text-xs overflow-x-auto">
            {edge.target}
          </code>
        </div>
        
        {edge.description && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
            <p className="text-sm">{edge.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(EdgeDetailsPanel);
