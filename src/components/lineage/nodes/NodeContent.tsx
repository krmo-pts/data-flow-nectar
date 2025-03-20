
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import NodeColumn from './NodeColumn';
import { Column } from '@/types/lineage';

interface NodeContentProps {
  expanded: boolean;
  columns: Column[];
  showAllColumns: boolean;
  toggleShowAll: (e: React.MouseEvent) => void;
}

const NodeContent: React.FC<NodeContentProps> = ({
  expanded,
  columns,
  showAllColumns,
  toggleShowAll
}) => {
  if (!expanded) return null;
  
  const maxVisibleColumns = showAllColumns ? 100 : 5;
  const visibleColumns = columns.slice(0, maxVisibleColumns);
  const hiddenColumnsCount = columns.length - visibleColumns.length;

  return (
    <div className="bg-white dark:bg-gray-900">
      {visibleColumns.length > 0 ? (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {visibleColumns.map((column, index) => (
            <NodeColumn key={index} name={column.name} type={column.type} />
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
  );
};

export default NodeContent;
