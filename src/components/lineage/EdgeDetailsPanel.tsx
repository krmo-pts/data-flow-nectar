
import React, { memo } from 'react';
import { EdgeData } from '@/types/lineage';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  if (!edge) return null;

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right"
        className="w-[400px] p-0 max-w-[min(420px,_calc(100vw_-_40px))] border-border h-[calc(100vh-32px)] my-4 mr-4 rounded-md overflow-hidden"
        onInteractOutside={onClose}
        hideCloseButton={true}
      >
        <div className="h-full flex flex-col">
          {/* Edge Header Section */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Edge Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {edge.label || 'Connection'}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {edge.transformationType && (
                    <Badge variant="outline" className={getTransformationTypeColor(edge.transformationType)}>
                      {edge.transformationType}
                    </Badge>
                  )}
                  {edge.isImpactPath && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Impact Path
                    </Badge>
                  )}
                </div>
                
                {edge.description && (
                  <p className="text-sm text-muted-foreground">{edge.description}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Edge Content Section */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
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
              
              {edge.metadata && Object.keys(edge.metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Metadata</h4>
                  <div className="space-y-2">
                    {Object.entries(edge.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-start">
                        <span className="text-xs font-medium min-w-24">{key}:</span>
                        <span className="text-xs">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default memo(EdgeDetailsPanel);
