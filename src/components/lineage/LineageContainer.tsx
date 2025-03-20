
import React, { useState } from 'react';
import LineageGraph from './LineageGraph';
import { ReactFlowProvider } from 'reactflow';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const LineageContainer: React.FC = () => {
  const [key, setKey] = useState(0);
  
  const resetLayout = () => {
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative">
      <div className="absolute top-4 right-4 z-10">
        <Button onClick={resetLayout} variant="outline" size="sm" className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Reset Layout
        </Button>
      </div>
      <ReactFlowProvider>
        <LineageGraph key={key} />
      </ReactFlowProvider>
    </div>
  );
};

export default LineageContainer;
