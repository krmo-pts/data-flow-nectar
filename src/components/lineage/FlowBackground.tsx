
import React from 'react';
import { Background, BackgroundVariant } from 'reactflow';

const FlowBackground: React.FC = () => {
  return (
    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
  );
};

export default FlowBackground;
