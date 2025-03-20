
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

export type ImpactType = 'upstream' | 'downstream' | 'direct' | 'none';

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
  isFocus?: boolean; // Property to mark this as the focus node
  impactType?: ImpactType; // New property to mark impact relationship to focus node
  impactDistance?: number; // How many nodes away from the focus node
  expandedUpstream?: boolean; // Whether upstream nodes are expanded
  expandedDownstream?: boolean; // Whether downstream nodes are expanded
  upstreamNodesShown?: string[]; // IDs of upstream nodes currently shown
  downstreamNodesShown?: string[]; // IDs of downstream nodes currently shown
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  description?: string;
  transformationType?: string;
  isImpactPath?: boolean; // New property to highlight edges in the impact path
}

export interface LineageData {
  nodes: NodeData[];
  edges: EdgeData[];
}
