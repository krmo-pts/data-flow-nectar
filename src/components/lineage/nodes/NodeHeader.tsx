
import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { ChevronDown, ChevronUp, Grid, Link, Unlink, ChevronsUp, ChevronsDown } from 'lucide-react';
import PlatformIcon from './PlatformIcon';

interface NodeHeaderProps {
  data: {
    id: string;
    name: string;
    platform: string;
    type: string;
    expandedUpstream?: boolean;
    expandedDownstream?: boolean;
  };
  expanded: boolean;
  toggleExpand: (e: React.MouseEvent) => void;
  hideIncomingLineage: boolean;
  hideOutgoingLineage: boolean;
  toggleIncomingLineage: (e: React.MouseEvent) => void;
  toggleOutgoingLineage: (e: React.MouseEvent) => void;
  expandUpstreamLineage: (e: React.MouseEvent) => void;
  expandDownstreamLineage: (e: React.MouseEvent) => void;
}

const NodeHeader: React.FC<NodeHeaderProps> = ({
  data,
  expanded,
  toggleExpand,
  hideIncomingLineage,
  hideOutgoingLineage,
  toggleIncomingLineage,
  toggleOutgoingLineage,
  expandUpstreamLineage,
  expandDownstreamLineage
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-between relative">
      <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
        <PlatformIcon platform={data.platform} />
        <div className="flex flex-col">
          <div className="font-medium">
            {data.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
            {data.platform} / {data.type}
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
        <button 
          className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm transition-colors ml-1"
          onClick={(e) => e.stopPropagation()} // Prevent node selection
        >
          <Grid size={16} />
        </button>
      </div>
      
      {/* Connection buttons for left side - incoming */}
      <div className="connection-button-container left">
        <button 
          className={`connection-button ${hideIncomingLineage ? '' : 'active'}`}
          onClick={toggleIncomingLineage}
          title={hideIncomingLineage ? "Show incoming lineage" : "Hide incoming lineage"}
        >
          {hideIncomingLineage ? <Link size={14} /> : <Unlink size={14} />}
        </button>
        
        <button 
          className={`connection-button expand-button ${data.expandedUpstream ? 'active' : ''}`}
          onClick={expandUpstreamLineage}
          title={data.expandedUpstream ? "Collapse upstream lineage" : "Expand upstream lineage"}
        >
          <ChevronsUp size={14} />
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
      
      {/* Connection buttons for right side - outgoing */}
      <div className="connection-button-container right">
        <button 
          className={`connection-button ${hideOutgoingLineage ? '' : 'active'}`}
          onClick={toggleOutgoingLineage}
          title={hideOutgoingLineage ? "Show outgoing lineage" : "Hide outgoing lineage"}
        >
          {hideOutgoingLineage ? <Link size={14} /> : <Unlink size={14} />}
        </button>
        
        <button 
          className={`connection-button expand-button ${data.expandedDownstream ? 'active' : ''}`}
          onClick={expandDownstreamLineage}
          title={data.expandedDownstream ? "Collapse downstream lineage" : "Expand downstream lineage"}
        >
          <ChevronsDown size={14} />
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
