
export type NodeType = 'table' | 'task' | 'report';

export type PlatformType = 
  | 'postgres' 
  | 'oracle' 
  | 'mysql' 
  | 'snowflake' 
  | 'tableau' 
  | 'powerbi' 
  | 'looker' 
  | 'azure' 
  | 'aws' 
  | 'gcp' 
  | 'other';

export interface Column {
  name: string;
  type: string;
  description?: string;
}

export interface NodeData {
  id: string;
  name: string;
  type: NodeType;
  platform: PlatformType;
  path: string;
  columns?: Column[];
  description?: string;
  owner?: string;
  lastUpdated?: string;
  tags?: string[];
  level?: number; // Optional level property for hierarchical layouts
  parentIds?: string[]; // Optional array of parent node IDs
  childIds?: string[]; // Optional array of child node IDs
  onExpandUpstream?: (nodeId: string) => void; // Handler for expanding upstream nodes
  onExpandDownstream?: (nodeId: string) => void; // Handler for expanding downstream nodes
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  description?: string;
  transformationType?: string;
}

export interface LineageData {
  nodes: NodeData[];
  edges: EdgeData[];
}
