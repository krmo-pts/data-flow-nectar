
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from '@/types/lineage';
import { LayoutResult } from './types';
import { createNodeMaps } from './nodeMaps';
import { calculateStandardLayout } from './standardLayout';
import { calculateLargeDatasetLayout } from './largeDatasetLayout';

/**
 * Calculates the initial layout for a lineage graph
 */
export const calculateInitialLayout = (
  nodes: NodeData[],
  edges: EdgeData[]
): LayoutResult => {
  console.time('layoutCalculation');
  
  // Create node maps for calculating dependencies
  const nodeMaps = createNodeMaps(nodes, edges);
  
  // Check if we're using a large dataset
  const isLargeDataset = nodes.length > 100;
  
  // For large datasets, use a specialized layout algorithm
  let result: LayoutResult;
  if (isLargeDataset) {
    result = calculateLargeDatasetLayout(nodes, edges, nodeMaps);
  } else {
    result = calculateStandardLayout(nodes, edges, nodeMaps);
  }

  console.timeEnd('layoutCalculation');
  console.log(`Positioned ${result.flowNodes.length} nodes and ${result.flowEdges.length} edges`);
  
  return result;
};
