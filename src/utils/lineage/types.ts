
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';

export interface NodeMaps {
  nodeMap: Map<string, NodeData>;
  incomingEdges: Map<string, string[]>;
  outgoingEdges: Map<string, string[]>;
}

export interface LayoutResult {
  flowNodes: Node[];
  flowEdges: Edge[];
}
