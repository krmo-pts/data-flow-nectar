
import React, { useState, useCallback } from 'react';
import LineageGraph from './LineageGraph';
import { ReactFlowProvider } from 'reactflow';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LineageContainer: React.FC = () => {
  const [key, setKey] = useState(0);
  const { toast } = useToast();
  
  const resetLayout = useCallback(() => {
    toast({
      title: "Resetting layout",
      description: "Rearranging nodes for better visualization",
      duration: 2000,
    });
    
    // Use requestAnimationFrame to avoid blocking the main thread
    requestAnimationFrame(() => {
      setKey(prevKey => prevKey + 1);
    });
  }, [toast]);

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
