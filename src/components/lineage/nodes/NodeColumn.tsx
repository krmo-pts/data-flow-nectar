
import React, { memo } from 'react';

interface ColumnProps {
  name: string;
  type: string;
}

const NodeColumn: React.FC<ColumnProps> = ({ name, type }) => (
  <div className="flex items-center justify-between px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">
    <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{name}</span>
    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{type}</span>
  </div>
);

export default memo(NodeColumn);
