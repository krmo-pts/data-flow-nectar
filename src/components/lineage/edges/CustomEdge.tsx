
import React, { memo } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
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
  // Use smoother bezier curves with appropriate curvature
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25, // Reduced curvature for cleaner edges
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className={`react-flow__edge-path transition-all duration-200 ${
          selected 
            ? 'stroke-primary stroke-[2px]' 
            : 'stroke-edge stroke-[1.5px]'
        }`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium 
              ${selected 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'bg-white/90 text-gray-700 border border-gray-200 shadow-sm backdrop-blur-sm'
              } transition-all duration-200`}>
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(CustomEdge);
