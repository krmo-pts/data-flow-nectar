
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../../../types/lineage';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  FileText, 
  BarChart3,
  Server,
  Cloud
} from 'lucide-react';

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'postgres':
    case 'oracle':
    case 'mysql':
    case 'snowflake':
      return <Database className="h-4 w-4" />;
    case 'tableau':
    case 'powerbi':
    case 'looker':
      return <BarChart3 className="h-4 w-4" />;
    case 'azure':
    case 'aws':
    case 'gcp':
      return <Cloud className="h-4 w-4" />;
    default:
      return <Server className="h-4 w-4" />;
  }
};

const getNodeTypeColor = (type: string) => {
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

const BaseNode = ({ data, selected }: NodeProps<NodeData>) => {
  const nodeTypeColor = getNodeTypeColor(data.type);
  
  return (
    <div className={`px-4 py-3 rounded-lg shadow-sm border ${selected ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border'} bg-background transition-all duration-200`}>
      <div className="flex items-center mb-2">
        <div className="flex items-center space-x-2">
          {getPlatformIcon(data.platform)}
          <span className="text-sm font-medium truncate max-w-[120px]" title={data.name}>
            {data.name}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`${nodeTypeColor} text-xs capitalize`}>
          {data.type}
        </Badge>
        {data.columns && (
          <span className="text-xs text-muted-foreground">
            {data.columns.length} columns
          </span>
        )}
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 rounded-full border-2 bg-background border-primary" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 rounded-full border-2 bg-background border-primary" 
      />
    </div>
  );
};

export default memo(BaseNode);
