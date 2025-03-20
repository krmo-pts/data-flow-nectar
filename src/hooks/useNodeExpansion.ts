
import { useState, useCallback } from 'react';

export const useNodeExpansion = () => {
  const [expanded, setExpanded] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  
  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setExpanded(prev => !prev);
  }, []);
  
  const toggleShowAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when toggling
    setShowAllColumns(prev => !prev);
  }, []);
  
  return {
    expanded,
    showAllColumns,
    toggleExpand,
    toggleShowAll
  };
};
