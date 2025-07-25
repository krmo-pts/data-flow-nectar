
import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2 } from 'lucide-react';
import PlatformIcon from './PlatformIcon';

interface NodeHeaderProps {
  data: {
    id: string;
    name: string;
    platform: string;
    type: string;
    path?: string;
  };
  expanded: boolean;
  toggleExpand: (e: React.MouseEvent) => void;
  hideIncomingLineage: boolean;
  hideOutgoingLineage: boolean;
  toggleIncomingLineage: (e: React.MouseEvent) => void;
  toggleOutgoingLineage: (e: React.MouseEvent) => void;
  isProcessingLineage?: boolean;
}

const NodeHeader: React.FC<NodeHeaderProps> = ({
  data,
  expanded,
  toggleExpand,
  hideIncomingLineage,
  hideOutgoingLineage,
  toggleIncomingLineage,
  toggleOutgoingLineage,
  isProcessingLineage = false
}) => {
  // Prepare the full path incorporating the node name if a path exists
  const fullPath = data.path 
    ? `${data.path}/${data.name}`
    : data.name;
    
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-between relative">
      <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
        <PlatformIcon platform={data.platform} />
        <div className="flex flex-col">
          <div className="font-medium">
            {data.name}
          </div>
          <div className="flex flex-col text-xs">
            {/* Platform as technology indicator */}
            <div className="font-medium text-blue-600 dark:text-blue-400">
              {data.platform}
            </div>
            
            {/* Full path including node name */}
            <div className="text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={fullPath}>
              {fullPath}
            </div>
            
            {/* Type element removed as requested */}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <button 
          onClick={toggleExpand}
          className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {/* Connection button for left side - positioned completely outside */}
      <div 
        className="absolute"
        style={{
          left: '-20px',  // Move further outside
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20
        }}
      >
        <button 
          className={`p-1.5 rounded-full bg-background border-2 ${
            isProcessingLineage ? 'border-gray-400' : 'border-primary'
          } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40`}
          onClick={toggleIncomingLineage}
          title={hideIncomingLineage ? "Show incoming lineage" : "Hide incoming lineage"}
          style={{ position: 'relative', zIndex: 30 }}
          disabled={isProcessingLineage}
        >
          {isProcessingLineage ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            hideIncomingLineage ? <Eye size={10} /> : <EyeOff size={10} />
          )}
        </button>
        <Handle 
          type="target" 
          position={Position.Left} 
          className="opacity-0" 
          isConnectable={!hideIncomingLineage}
          style={{ 
            width: '10px', 
            height: '10px', 
            left: '-5px',
            zIndex: 10
          }}
        />
      </div>
      
      {/* Connection button for right side - positioned completely outside */}
      <div 
        className="absolute"
        style={{
          right: '-20px', // Move further outside
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20
        }}
      >
        <button 
          className={`p-1.5 rounded-full bg-background border-2 ${
            isProcessingLineage ? 'border-gray-400' : 'border-primary'
          } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40`}
          onClick={toggleOutgoingLineage}
          title={hideOutgoingLineage ? "Show outgoing lineage" : "Hide outgoing lineage"}
          style={{ position: 'relative', zIndex: 30 }}
          disabled={isProcessingLineage}
        >
          {isProcessingLineage ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            hideOutgoingLineage ? <Eye size={10} /> : <EyeOff size={10} />
          )}
        </button>
        <Handle 
          type="source" 
          position={Position.Right} 
          className="opacity-0" 
          isConnectable={!hideOutgoingLineage}
          style={{ 
            width: '10px', 
            height: '10px', 
            right: '-5px',
            zIndex: 10
          }}
        />
      </div>
    </div>
  );
};

export default NodeHeader;
