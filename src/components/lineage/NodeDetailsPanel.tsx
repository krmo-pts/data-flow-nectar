
import React, { memo } from 'react';
import { NodeData, Column, ImpactType } from '@/types/lineage';
import { X, Target, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NodeDetailsPanelProps {
  node: NodeData | null;
  onClose: () => void;
  isOpen: boolean;
  onSetFocus?: (nodeId: string) => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ 
  node, 
  onClose,
  isOpen,
  onSetFocus
}) => {
  if (!isOpen || !node) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'table':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'task':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'report':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'postgres':
      case 'oracle':
      case 'mysql':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'snowflake':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'tableau':
      case 'powerbi':
      case 'looker':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'azure':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'aws':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'gcp':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactTypeBadge = (impactType?: ImpactType) => {
    switch (impactType) {
      case 'direct':
        return <Badge variant="outline" className="bg-sky-100 text-sky-800 border-sky-200">Focus Node</Badge>;
      case 'upstream':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
            <ArrowUpCircle size={12} />
            Upstream Dependency
          </Badge>
        );
      case 'downstream':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <ArrowDownCircle size={12} />
            Downstream Dependency
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleSetFocus = () => {
    if (onSetFocus && node) {
      onSetFocus(node.id);
    }
  };

  return (
    <div className={`node-details-panel ${isOpen ? 'open' : 'closed'} glass-panel`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Node Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-foreground">{node.name}</h3>
            {onSetFocus && (
              <Button 
                variant={node.isFocus ? "default" : "outline"}
                size="sm" 
                onClick={handleSetFocus}
                className="flex items-center gap-1"
              >
                <Target size={14} />
                <span>{node.isFocus ? 'Focused' : 'Set as focus'}</span>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={getTypeColor(node.type)}>
              {node.type}
            </Badge>
            <Badge variant="outline" className={getPlatformColor(node.platform)}>
              {node.platform}
            </Badge>
            {getImpactTypeBadge(node.impactType)}
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
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Path</h4>
          <code className="block p-2 bg-secondary rounded text-xs overflow-x-auto">
            {node.path}
          </code>
        </div>
        
        {node.owner && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Owner</h4>
            <p className="text-sm">{node.owner}</p>
          </div>
        )}
        
        {node.lastUpdated && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
            <p className="text-sm">{new Date(node.lastUpdated).toLocaleString()}</p>
          </div>
        )}
        
        {node.tags && node.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {node.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {node.columns && node.columns.length > 0 && (
          <div>
            <Separator className="my-4" />
            <h4 className="text-sm font-medium mb-2">Structure ({node.columns.length} columns)</h4>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-foreground">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {node.columns.map((column: Column) => (
                      <tr key={column.name} className="text-sm border-b border-border last:border-0">
                        <td className="py-2 pr-4 font-medium">{column.name}</td>
                        <td className="py-2 text-muted-foreground">{column.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(NodeDetailsPanel);
