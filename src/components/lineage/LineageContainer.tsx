
import React, { useState } from 'react';
import LineageGraph from './LineageGraph';
import { ReactFlowProvider } from 'reactflow';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LineageContainer: React.FC = () => {
  const [key, setKey] = useState(0);
  
  const resetLayout = () => {
    setKey(prevKey => prevKey + 1);
    
    // Show a toast notification using the correct properties from the Toast type
    toast({
      title: "Layout Reset",
      description: "The graph layout has been reset to its initial state.",
      variant: "default",
    });
  };

  return (
    <div className="w-full h-full relative">
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
