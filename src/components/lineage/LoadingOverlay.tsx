
import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  datasetSize: 'small' | 'large' | 'veryLarge';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, datasetSize }) => {
  if (!isVisible) return null;
  
  let sizeDescription: string;
  let nodeCount: number;
  let edgeCount: number;
  
  switch (datasetSize) {
    case 'large':
      sizeDescription = 'large';
      nodeCount = 200;
      edgeCount = 400;
      break;
    case 'veryLarge':
      sizeDescription = 'very large';
      nodeCount = 600;
      edgeCount = 1200;
      break;
    default:
      sizeDescription = 'small';
      nodeCount = 0;
      edgeCount = 0;
  }
  
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p className="text-sm text-muted-foreground">
          Loading {sizeDescription} dataset...
        </p>
        {datasetSize !== 'small' && (
          <p className="text-xs text-muted-foreground mt-1">
            ({nodeCount} nodes and ~{edgeCount} edges - this may take a moment)
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
