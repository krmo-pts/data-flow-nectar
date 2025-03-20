
import { LineageData, NodeData, EdgeData } from '../types/lineage';

export const mockNodes: NodeData[] = [
  {
    id: 'table1',
    name: 'Customer Data',
    type: 'table',
    platform: 'postgres',
    path: '/schemas/public/customers',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'name', type: 'varchar' },
      { name: 'email', type: 'varchar' },
      { name: 'created_at', type: 'timestamp' }
    ],
    description: 'Central customer information repository',
    owner: 'Data Team',
    lastUpdated: '2023-05-15T14:30:00Z',
    tags: ['core', 'customer']
  },
  {
    id: 'table2',
    name: 'Orders',
    type: 'table',
    platform: 'postgres',
    path: '/schemas/public/orders',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'customer_id', type: 'uuid' },
      { name: 'amount', type: 'decimal' },
      { name: 'created_at', type: 'timestamp' }
    ],
    description: 'Customer order history',
    owner: 'Data Team',
    lastUpdated: '2023-05-14T10:15:00Z',
    tags: ['core', 'transactions']
  },
  {
    id: 'task1',
    name: 'Customer Enrichment',
    type: 'task',
    platform: 'aws',
    path: '/data-pipeline/customer-enrichment',
    description: 'Enriches customer data with third-party information',
    owner: 'Data Engineering',
    lastUpdated: '2023-05-12T08:45:00Z',
    tags: ['etl', 'enrichment']
  },
  {
    id: 'table3',
    name: 'Enriched Customers',
    type: 'table',
    platform: 'snowflake',
    path: '/warehouse/customers_enriched',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'name', type: 'varchar' },
      { name: 'email', type: 'varchar' },
      { name: 'lifetime_value', type: 'decimal' },
      { name: 'segment', type: 'varchar' },
      { name: 'created_at', type: 'timestamp' }
    ],
    description: 'Enriched customer data with calculated metrics',
    owner: 'Data Team',
    lastUpdated: '2023-05-10T16:20:00Z',
    tags: ['enriched', 'customer']
  },
  {
    id: 'task2',
    name: 'Order Analytics',
    type: 'task',
    platform: 'aws',
    path: '/data-pipeline/order-analytics',
    description: 'Processes order data for analytics dashboards',
    owner: 'Data Engineering',
    lastUpdated: '2023-05-11T09:30:00Z',
    tags: ['etl', 'analytics']
  },
  {
    id: 'table4',
    name: 'Order Summary',
    type: 'table',
    platform: 'snowflake',
    path: '/warehouse/order_summary',
    columns: [
      { name: 'date', type: 'date' },
      { name: 'total_orders', type: 'integer' },
      { name: 'total_revenue', type: 'decimal' },
      { name: 'avg_order_value', type: 'decimal' }
    ],
    description: 'Daily order summary metrics',
    owner: 'Data Team',
    lastUpdated: '2023-05-09T12:00:00Z',
    tags: ['analytics', 'summary']
  },
  {
    id: 'report1',
    name: 'Customer Dashboard',
    type: 'report',
    platform: 'tableau',
    path: '/dashboards/customer-insights',
    description: 'Customer overview and insights dashboard',
    owner: 'BI Team',
    lastUpdated: '2023-05-08T15:40:00Z',
    tags: ['dashboard', 'customer']
  },
  {
    id: 'report2',
    name: 'Revenue Analysis',
    type: 'report',
    platform: 'powerbi',
    path: '/reports/revenue-analysis',
    description: 'Detailed revenue trends and analysis',
    owner: 'BI Team',
    lastUpdated: '2023-05-07T11:25:00Z',
    tags: ['report', 'revenue']
  }
];

export const mockEdges: EdgeData[] = [
  {
    id: 'edge1',
    source: 'table1',
    target: 'task1',
    label: 'Input',
    description: 'Raw customer data input for enrichment process',
    transformationType: 'Extract'
  },
  {
    id: 'edge2',
    source: 'task1',
    target: 'table3',
    label: 'Output',
    description: 'Enriched customer data output',
    transformationType: 'Load'
  },
  {
    id: 'edge3',
    source: 'table2',
    target: 'task2',
    label: 'Input',
    description: 'Raw order data for analytics processing',
    transformationType: 'Extract'
  },
  {
    id: 'edge4',
    source: 'task2',
    target: 'table4',
    label: 'Output',
    description: 'Processed order summary data',
    transformationType: 'Load'
  },
  {
    id: 'edge5',
    source: 'table3',
    target: 'report1',
    label: 'Source',
    description: 'Data source for customer dashboard',
    transformationType: 'Read'
  },
  {
    id: 'edge6',
    source: 'table4',
    target: 'report2',
    label: 'Source',
    description: 'Data source for revenue analysis report',
    transformationType: 'Read'
  },
  {
    id: 'edge7',
    source: 'table1',
    target: 'table2',
    label: 'Relation',
    description: 'Customer to orders relationship',
    transformationType: 'Join'
  }
];

export const mockLineageData: LineageData = {
  nodes: mockNodes,
  edges: mockEdges
};
