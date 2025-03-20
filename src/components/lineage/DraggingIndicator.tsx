
import React from 'react';

interface DraggingIndicatorProps {
  showOverlay: boolean;
}

const DraggingIndicator: React.FC<DraggingIndicatorProps> = ({ showOverlay }) => {
  if (!showOverlay) return null;

  return (
    <div className="absolute top-16 right-4 z-50 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-border">
      <div className="text-xs text-muted-foreground">
        Optimizing rendering during drag operation...
      </div>
    </div>
  );
};

export default DraggingIndicator;
