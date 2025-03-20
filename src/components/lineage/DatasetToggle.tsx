
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DatasetToggleProps {
  datasetSize: 'small' | 'large' | 'veryLarge';
  setDatasetSize: (size: 'small' | 'large' | 'veryLarge') => void;
  isLoading: boolean;
}

const DatasetToggle: React.FC<DatasetToggleProps> = ({ 
  datasetSize, 
  setDatasetSize, 
  isLoading 
}) => {
  return (
    <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-border">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Dataset Size</h3>
        <RadioGroup
          value={datasetSize}
          onValueChange={(value) => setDatasetSize(value as 'small' | 'large' | 'veryLarge')}
          disabled={isLoading}
          className="space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="dataset-small" />
            <Label htmlFor="dataset-small" className="text-sm">Small (default)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="dataset-large" />
            <Label htmlFor="dataset-large" className="text-sm">Large (200 nodes)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="veryLarge" id="dataset-very-large" />
            <Label htmlFor="dataset-very-large" className="text-sm">Very Large (600 nodes)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default DatasetToggle;
