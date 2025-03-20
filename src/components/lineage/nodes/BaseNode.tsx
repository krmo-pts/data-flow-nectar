
import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../../../types/lineage';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  FileText, 
  BarChart3,
  Server,
  Cloud,
  ArrowRight,
  Grid,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
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
  const [expanded, setExpanded] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  
  const nodeTypeColor = getNodeTypeColor(data.type);
  const maxVisibleColumns = showAllColumns ? 100 : 5;

  // Ensure we have columns data
  const columns = data.columns || [];
  const visibleColumns = expanded ? columns.slice(0, maxVisibleColumns) : [];
  const hiddenColumnsCount = columns.length - visibleColumns.length;
  
  const toggleExpand = () => setExpanded(!expanded);
  const toggleShowAll = () => setShowAllColumns(!showAllColumns);
  
  return (
    <>
      {/* We removed the outer div and applied styling directly to React Flow's default node container */}
      
      {/* Header section */}
      <div className="border-b border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          {getPlatformIcon(data.platform)}
          <div className="flex flex-col">
            <div className="font-medium">
              {data.name}
            </div>
            <div className="text-xs text-gray-500 font-normal">
              {data.platform} / {data.type}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            onClick={toggleExpand}
            className="p-1 text-gray-500 hover:bg-gray-200 rounded-sm transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded-sm transition-colors ml-1">
            <Grid size={16} />
          </button>
        </div>
      </div>
      
      {/* Columns section */}
      {expanded && (
        <div className="bg-white rounded-b-lg">
          {visibleColumns.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {visibleColumns.map((column, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-1.5 hover:bg-gray-50">
                  <span className="text-sm text-gray-800 truncate">{column.name}</span>
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{column.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No columns available
            </div>
          )}
          
          {/* Footer controls */}
          {columns.length > 5 && (
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 rounded-b-lg">
              <button 
                className="hover:underline flex items-center space-x-1"
                onClick={toggleShowAll}
              >
                {showAllColumns ? (
                  <>
                    <EyeOff size={14} />
                    <span>Hide unused columns</span>
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    <span>Show all {columns.length} columns</span>
                  </>
                )}
              </button>
              
              <span className="text-xs text-gray-500">
                {hiddenColumnsCount > 0 && `+${hiddenColumnsCount} more`}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Handles for connections */}
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
    </>
  );
};

export default memo(BaseNode);
