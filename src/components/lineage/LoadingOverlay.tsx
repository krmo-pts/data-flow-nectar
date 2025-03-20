
import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  useLargeDataset: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, useLargeDataset }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p className="text-sm text-muted-foreground">
          Loading {useLargeDataset ? 'large' : 'small'} dataset...
        </p>
        {useLargeDataset && (
          <p className="text-xs text-muted-foreground mt-1">
            (200 nodes and ~400 edges - this may take a moment)
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
