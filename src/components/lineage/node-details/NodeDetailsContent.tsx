
import React from 'react';
import { NodeData } from '@/types/lineage';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ColumnTable from './ColumnTable';

interface NodeDetailsContentProps {
  node: NodeData;
}

const NodeDetailsContent: React.FC<NodeDetailsContentProps> = ({ node }) => {
  return (
    <ScrollArea className="flex-1 p-6">
      <div className="space-y-6">
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
          <ColumnTable columns={node.columns} />
        )}
      </div>
    </ScrollArea>
  );
};

export default NodeDetailsContent;
