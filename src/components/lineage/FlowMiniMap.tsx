
import React from 'react';
import { MiniMap } from 'reactflow';

const FlowMiniMap: React.FC = () => {
  return (
    <MiniMap
      nodeColor={(node) => {
        switch (node.data.type) {
          case 'table':
            return '#dbeafe';
          case 'task':
            return '#dcfce7';
          case 'report':
            return '#f3e8ff';
          default:
            return '#f1f5f9';
        }
      }}
      maskColor="rgba(240, 240, 250, 0.1)"
      className="glass-panel"
    />
  );
};

export default FlowMiniMap;
