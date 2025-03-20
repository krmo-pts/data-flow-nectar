
import React from 'react';
import { NodeTypes, EdgeTypes } from 'reactflow';
import BaseNode from '../nodes/BaseNode';
import CustomEdge from '../edges/CustomEdge';

/**
 * Node type definitions for ReactFlow
 */
export const nodeTypes: NodeTypes = {
  default: BaseNode,
};

/**
 * Edge type definitions for ReactFlow
 */
export const edgeTypes: EdgeTypes = {
  default: CustomEdge,
};
