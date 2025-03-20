
import React from 'react';
import LineageGraph from './LineageGraph';
import { ReactFlowProvider } from 'reactflow';

const LineageContainer: React.FC = () => {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ReactFlowProvider>
        <LineageGraph />
      </ReactFlowProvider>
    </div>
  );
};

export default LineageContainer;
