
// This file reexports all tracing functions from the new modular structure
// to maintain backward compatibility with existing code
export { 
  createTracingMaps,
  traceUpstreamDependencies,
  traceDownstreamDependencies,
  traceLineageDependencies
} from './tracing';
