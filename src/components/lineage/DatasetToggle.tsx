
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DatasetToggleProps {
  useLargeDataset: boolean;
  toggleDataset: () => void;
  isLoading: boolean;
}

const DatasetToggle: React.FC<DatasetToggleProps> = ({ 
  useLargeDataset, 
  toggleDataset, 
  isLoading 
}) => {
  return (
    <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-border">
      <div className="flex items-center space-x-2">
        <Switch 
          id="dataset-toggle" 
          checked={useLargeDataset} 
          onCheckedChange={toggleDataset} 
          disabled={isLoading}
        />
        <Label htmlFor="dataset-toggle">Use large dataset ({useLargeDataset ? '200 nodes' : 'small'})</Label>
      </div>
    </div>
  );
};

export default DatasetToggle;
