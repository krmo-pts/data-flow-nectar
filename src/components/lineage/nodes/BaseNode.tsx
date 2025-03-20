
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
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight
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

const getNodeTypeClass = (type: string) => {
  switch (type) {
    case 'table':
      return 'node-table';
    case 'task':
      return 'node-task';
    case 'report':
      return 'node-report';
    default:
      return '';
  }
};

const BaseNode = ({ data, selected }: NodeProps<NodeData>) => {
  const [expanded, setExpanded] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  
  const nodeTypeClass = getNodeTypeClass(data.type);
  const maxVisibleColumns = showAllColumns ? 100 : 5;

  // Ensure we have columns data
  const columns = data.columns || [];
  const visibleColumns = expanded ? columns.slice(0, maxVisibleColumns) : [];
  const hiddenColumnsCount = columns.length - visibleColumns.length;
  
  const toggleExpand = () => setExpanded(!expanded);
  const toggleShowAll = () => setShowAllColumns(!showAllColumns);
  
  const handleExpandUpstream = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onExpandUpstream) {
      data.onExpandUpstream(data.id);
    }
  };

  const handleExpandDownstream = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onExpandDownstream) {
      data.onExpandDownstream(data.id);
    }
  };

  return (
    <div className={`shadow-md rounded-lg overflow-hidden ${nodeTypeClass} transition-all duration-200 ${selected ? 'ring-2 ring-primary/40' : ''}`} style={{ minWidth: '240px' }}>
      {/* Header section */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
          {getPlatformIcon(data.platform)}
          <div className="flex flex-col">
            <div className="font-medium">
              {data.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
              {data.platform} / {data.type}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Expand upstream"
            onClick={handleExpandUpstream}
            className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm transition-colors"
          >
            <ArrowUpRight size={16} />
          </button>
          <button
            title="Expand downstream" 
            onClick={handleExpandDownstream}
            className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm transition-colors"
          >
            <ArrowDownRight size={16} />
          </button>
          <button 
            onClick={toggleExpand}
            className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {/* Columns section */}
      {expanded && (
        <div className="bg-white dark:bg-gray-900">
          {visibleColumns.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleColumns.map((column, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{column.name}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{column.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No columns available
            </div>
          )}
          
          {/* Footer controls */}
          {columns.length > 5 && (
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
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
              
              <span className="text-xs text-gray-500 dark:text-gray-400">
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
    </div>
  );
};

export default memo(BaseNode);
