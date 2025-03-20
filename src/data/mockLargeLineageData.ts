
import { LineageData, NodeData, EdgeData, NodeType, PlatformType } from '../types/lineage';

// Helper function to generate a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to generate a random subset of items from an array
const getRandomSubset = <T>(array: T[], maxItems: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.max(1, Math.floor(Math.random() * maxItems)));
};

// Generate a large dataset with 200 nodes and ~400 edges
export const generateLargeLineageData = (): LineageData => {
  const nodeTypes: NodeType[] = ['table', 'task', 'report'];
  const platforms: PlatformType[] = [
    'postgres', 'oracle', 'mysql', 'snowflake', 
    'tableau', 'powerbi', 'looker', 
    'azure', 'aws', 'gcp', 'other'
  ];
  
  const dataTypes = [
    'uuid', 'integer', 'bigint', 'varchar', 'text', 
    'date', 'timestamp', 'boolean', 'decimal', 'json', 
    'array', 'float', 'double', 'char', 'binary'
  ];
  
  const tableNamePrefixes = [
    'dim', 'fact', 'stg', 'raw', 'ods', 'dw', 'edw', 
    'mart', 'temp', 'ext', 'core', 'ref', 'base', 'agg'
  ];
  
  const tableNameSuffixes = [
    'customers', 'orders', 'products', 'sales', 'inventory', 
    'employees', 'transactions', 'accounts', 'addresses', 'metrics', 
    'payments', 'shipments', 'returns', 'reviews', 'clicks', 'events'
  ];
  
  const taskNamePrefixes = [
    'extract', 'transform', 'load', 'process', 'analyze', 
    'sync', 'calculate', 'aggregate', 'ingest', 'validate', 
    'clean', 'enrich', 'normalize', 'deduplicate', 'partition'
  ];
  
  const reportNamePrefixes = [
    'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 
    'executive', 'operational', 'financial', 'sales', 'marketing', 
    'customer', 'product', 'inventory', 'performance', 'trend'
  ];
  
  const reportNameSuffixes = [
    'dashboard', 'report', 'analysis', 'summary', 'metrics', 
    'kpi', 'insights', 'overview', 'performance', 'forecast', 
    'trends', 'comparison', 'detail', 'visualization', 'scorecard'
  ];

  const transformationTypes = [
    'Extract', 'Transform', 'Load', 'Join', 'Filter', 
    'Aggregate', 'Sort', 'Union', 'Intersect', 'Window', 
    'Lookup', 'Merge', 'Split', 'Pivot', 'Unpivot', 'Read'
  ];
  
  const tags = [
    'core', 'analytics', 'reporting', 'operations', 'finance', 
    'sales', 'marketing', 'customer', 'product', 'inventory', 
    'etl', 'warehouse', 'staging', 'raw', 'processed', 'metrics', 
    'enriched', 'sensitive', 'internal', 'external', 'high-priority'
  ];
  
  const owners = [
    'Data Team', 'BI Team', 'Analytics Team', 'Data Engineering', 
    'Data Science', 'IT Operations', 'Marketing Analytics', 
    'Finance Team', 'Sales Operations', 'Product Analytics'
  ];
  
  // Generate 200 unique nodes
  const nodes: NodeData[] = [];
  
  for (let i = 0; i < 200; i++) {
    const nodeType = getRandomItem(nodeTypes);
    const platform = getRandomItem(platforms);
    
    let name = '';
    let path = '';
    
    if (nodeType === 'table') {
      const prefix = getRandomItem(tableNamePrefixes);
      const suffix = getRandomItem(tableNameSuffixes);
      name = `${prefix}_${suffix}_${i}`;
      path = `/schemas/public/${name}`;
    } else if (nodeType === 'task') {
      const prefix = getRandomItem(taskNamePrefixes);
      name = `${prefix}_job_${i}`;
      path = `/data-pipeline/${name}`;
    } else if (nodeType === 'report') {
      const prefix = getRandomItem(reportNamePrefixes);
      const suffix = getRandomItem(reportNameSuffixes);
      name = `${prefix}_${suffix}_${i}`;
      path = `/dashboards/${name}`;
    }
    
    // Generate between 3-15 columns for tables
    const columns = nodeType === 'table' 
      ? Array.from({ length: 3 + Math.floor(Math.random() * 12) }, (_, colIndex) => {
          return {
            name: colIndex === 0 ? 'id' : `field_${colIndex}`,
            type: colIndex === 0 ? 'uuid' : getRandomItem(dataTypes),
            description: colIndex === 0 ? 'Primary key' : `Description for field_${colIndex}`
          };
        })
      : undefined;
    
    // Generate a date in the last 90 days
    const lastUpdated = new Date(
      Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
    ).toISOString();
    
    nodes.push({
      id: `node_${i}`,
      name,
      type: nodeType,
      platform,
      path,
      columns,
      description: `Auto-generated ${nodeType} for performance testing`,
      owner: getRandomItem(owners),
      lastUpdated,
      tags: getRandomSubset(tags, 4),
    });
  }
  
  // Generate approximately 400 edges
  const edges: EdgeData[] = [];
  
  // First, ensure each node (except the last one) has at least one outgoing edge
  for (let i = 0; i < nodes.length - 1; i++) {
    const source = nodes[i].id;
    const target = nodes[i + 1].id;
    
    edges.push({
      id: `edge_${i}_${i + 1}`,
      source,
      target,
      label: getRandomItem(transformationTypes),
      transformationType: getRandomItem(transformationTypes),
      description: `Auto-generated edge from ${nodes[i].name} to ${nodes[i + 1].name}`
    });
  }
  
  // Add remaining random edges to reach approximately 400
  const remainingEdges = 400 - edges.length;
  
  for (let i = 0; i < remainingEdges; i++) {
    let sourceIndex = Math.floor(Math.random() * nodes.length);
    let targetIndex = Math.floor(Math.random() * nodes.length);
    
    // Ensure we don't create self-loops or duplicate edges
    while (
      sourceIndex === targetIndex || 
      edges.some(e => e.source === nodes[sourceIndex].id && e.target === nodes[targetIndex].id)
    ) {
      sourceIndex = Math.floor(Math.random() * nodes.length);
      targetIndex = Math.floor(Math.random() * nodes.length);
    }
    
    const source = nodes[sourceIndex].id;
    const target = nodes[targetIndex].id;
    
    edges.push({
      id: `edge_random_${i}`,
      source,
      target,
      label: getRandomItem(transformationTypes),
      transformationType: getRandomItem(transformationTypes),
      description: `Auto-generated edge from ${nodes[sourceIndex].name} to ${nodes[targetIndex].name}`
    });
  }
  
  return {
    nodes,
    edges
  };
};

// Generate a very large dataset with 600 nodes and ~1200 edges
export const generateVeryLargeLineageData = (): LineageData => {
  const nodeTypes: NodeType[] = ['table', 'task', 'report'];
  const platforms: PlatformType[] = [
    'postgres', 'oracle', 'mysql', 'snowflake', 
    'tableau', 'powerbi', 'looker', 
    'azure', 'aws', 'gcp', 'other'
  ];
  
  const dataTypes = [
    'uuid', 'integer', 'bigint', 'varchar', 'text', 
    'date', 'timestamp', 'boolean', 'decimal', 'json', 
    'array', 'float', 'double', 'char', 'binary'
  ];
  
  const tableNamePrefixes = [
    'dim', 'fact', 'stg', 'raw', 'ods', 'dw', 'edw', 
    'mart', 'temp', 'ext', 'core', 'ref', 'base', 'agg'
  ];
  
  const tableNameSuffixes = [
    'customers', 'orders', 'products', 'sales', 'inventory', 
    'employees', 'transactions', 'accounts', 'addresses', 'metrics', 
    'payments', 'shipments', 'returns', 'reviews', 'clicks', 'events'
  ];
  
  const taskNamePrefixes = [
    'extract', 'transform', 'load', 'process', 'analyze', 
    'sync', 'calculate', 'aggregate', 'ingest', 'validate', 
    'clean', 'enrich', 'normalize', 'deduplicate', 'partition'
  ];
  
  const reportNamePrefixes = [
    'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 
    'executive', 'operational', 'financial', 'sales', 'marketing', 
    'customer', 'product', 'inventory', 'performance', 'trend'
  ];
  
  const reportNameSuffixes = [
    'dashboard', 'report', 'analysis', 'summary', 'metrics', 
    'kpi', 'insights', 'overview', 'performance', 'forecast', 
    'trends', 'comparison', 'detail', 'visualization', 'scorecard'
  ];

  const transformationTypes = [
    'Extract', 'Transform', 'Load', 'Join', 'Filter', 
    'Aggregate', 'Sort', 'Union', 'Intersect', 'Window', 
    'Lookup', 'Merge', 'Split', 'Pivot', 'Unpivot', 'Read'
  ];
  
  const tags = [
    'core', 'analytics', 'reporting', 'operations', 'finance', 
    'sales', 'marketing', 'customer', 'product', 'inventory', 
    'etl', 'warehouse', 'staging', 'raw', 'processed', 'metrics', 
    'enriched', 'sensitive', 'internal', 'external', 'high-priority'
  ];
  
  const owners = [
    'Data Team', 'BI Team', 'Analytics Team', 'Data Engineering', 
    'Data Science', 'IT Operations', 'Marketing Analytics', 
    'Finance Team', 'Sales Operations', 'Product Analytics'
  ];
  
  // Generate 600 unique nodes
  const nodes: NodeData[] = [];
  
  for (let i = 0; i < 600; i++) {
    const nodeType = getRandomItem(nodeTypes);
    const platform = getRandomItem(platforms);
    
    let name = '';
    let path = '';
    
    if (nodeType === 'table') {
      const prefix = getRandomItem(tableNamePrefixes);
      const suffix = getRandomItem(tableNameSuffixes);
      name = `${prefix}_${suffix}_${i}`;
      path = `/schemas/public/${name}`;
    } else if (nodeType === 'task') {
      const prefix = getRandomItem(taskNamePrefixes);
      name = `${prefix}_job_${i}`;
      path = `/data-pipeline/${name}`;
    } else if (nodeType === 'report') {
      const prefix = getRandomItem(reportNamePrefixes);
      const suffix = getRandomItem(reportNameSuffixes);
      name = `${prefix}_${suffix}_${i}`;
      path = `/dashboards/${name}`;
    }
    
    // Generate between 3-15 columns for tables
    const columns = nodeType === 'table' 
      ? Array.from({ length: 3 + Math.floor(Math.random() * 12) }, (_, colIndex) => {
          return {
            name: colIndex === 0 ? 'id' : `field_${colIndex}`,
            type: colIndex === 0 ? 'uuid' : getRandomItem(dataTypes),
            description: colIndex === 0 ? 'Primary key' : `Description for field_${colIndex}`
          };
        })
      : undefined;
    
    // Generate a date in the last 90 days
    const lastUpdated = new Date(
      Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
    ).toISOString();
    
    nodes.push({
      id: `node_${i}`,
      name,
      type: nodeType,
      platform,
      path,
      columns,
      description: `Auto-generated ${nodeType} for performance testing`,
      owner: getRandomItem(owners),
      lastUpdated,
      tags: getRandomSubset(tags, 4),
    });
  }
  
  // Generate approximately 1200 edges
  const edges: EdgeData[] = [];
  
  // First, ensure each node (except the last one) has at least one outgoing edge
  for (let i = 0; i < nodes.length - 1; i++) {
    const source = nodes[i].id;
    const target = nodes[i + 1].id;
    
    edges.push({
      id: `edge_${i}_${i + 1}`,
      source,
      target,
      label: getRandomItem(transformationTypes),
      transformationType: getRandomItem(transformationTypes),
      description: `Auto-generated edge from ${nodes[i].name} to ${nodes[i + 1].name}`
    });
  }
  
  // Add remaining edges to reach approximately 1200
  const remainingEdges = 1200 - edges.length;
  
  for (let i = 0; i < remainingEdges; i++) {
    let sourceIndex = Math.floor(Math.random() * nodes.length);
    let targetIndex = Math.floor(Math.random() * nodes.length);
    
    // Ensure we don't create self-loops or duplicate edges
    while (
      sourceIndex === targetIndex || 
      edges.some(e => e.source === nodes[sourceIndex].id && e.target === nodes[targetIndex].id)
    ) {
      sourceIndex = Math.floor(Math.random() * nodes.length);
      targetIndex = Math.floor(Math.random() * nodes.length);
    }
    
    const source = nodes[sourceIndex].id;
    const target = nodes[targetIndex].id;
    
    edges.push({
      id: `edge_random_${i}`,
      source,
      target,
      label: getRandomItem(transformationTypes),
      transformationType: getRandomItem(transformationTypes),
      description: `Auto-generated edge from ${nodes[sourceIndex].name} to ${nodes[targetIndex].name}`
    });
  }
  
  return {
    nodes,
    edges
  };
};

// Pre-generate the datasets
export const mockLargeLineageData: LineageData = generateLargeLineageData();
export const mockVeryLargeLineageData: LineageData = generateVeryLargeLineageData();
