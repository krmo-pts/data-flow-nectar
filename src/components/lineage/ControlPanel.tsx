
import React from 'react';
import { Panel, useReactFlow } from 'reactflow';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  resetView: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ resetView }) => {
  const reactFlowInstance = useReactFlow();
  
  const fitView = () => {
    reactFlowInstance.fitView({ padding: 0.2 });
  };
  
  return (
    <Panel position="bottom-left" className="glass-panel p-2 rounded-md flex items-center space-x-2">
      <Button size="sm" onClick={() => reactFlowInstance.zoomIn()} className="h-8 w-8 p-0">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button size="sm" onClick={() => reactFlowInstance.zoomOut()} className="h-8 w-8 p-0">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button size="sm" onClick={fitView} className="h-8 w-8 p-0">
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button size="sm" onClick={resetView} className="h-8 w-8 p-0">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </Panel>
  );
};

export default ControlPanel;
