
// This file reexports all tracing functions from the new modular structure
// to maintain backward compatibility with existing code
export { 
  createTracingMaps,
  traceUpstreamDependencies,
  traceDownstreamDependencies,
  traceLineageDependencies
} from './tracing';

// For compatibility with older code that might use nodeMaps
export { createNodeMaps } from './nodeMaps';
