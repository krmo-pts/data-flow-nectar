
import React, { memo, useMemo } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  useStore
} from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}: EdgeProps) => {
  // Get current viewport zoom level to optimize rendering
  const zoom = useStore((state) => state.transform[2]);
  
  // Only render edge labels when zoomed in enough and not too many edges
  const showLabel = zoom > 1.0 && data?.label;
  
  // Optimize path calculation with memoization
  const [edgePath, labelX, labelY] = useMemo(() => getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.2, // Reduced curvature for straighter paths
  }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

  // Optimize edge styling based on zoom level
  const strokeWidth = useMemo(() => (
    zoom < 0.5 ? '1px' : selected ? '2px' : '1.5px'
  ), [zoom, selected]);

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth,
          transition: 'none', // Remove transitions for better performance
        }}
        className={`react-flow__edge-path ${selected ? 'stroke-primary' : 'stroke-muted-foreground/60'}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              opacity: zoom < 1 ? 0.7 : 1,
            }}
            className="nodrag nopan"
          >
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              selected 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'bg-background/80 text-muted-foreground border border-border'
            }`}>
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(CustomEdge);
