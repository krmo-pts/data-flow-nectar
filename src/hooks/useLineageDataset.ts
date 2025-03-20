
import { useState, useCallback } from 'react';
import { mockLineageData } from '@/data/mockLineageData';
import { mockLargeLineageData, mockVeryLargeLineageData } from '@/data/mockLargeLineageData';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing dataset size selection
 */
export function useLineageDataset() {
  const [datasetSize, setDatasetSize] = useState<'small' | 'large' | 'veryLarge'>('small');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Safely change the dataset size
   */
  const setDatasetSizeHandler = useCallback((size: 'small' | 'large' | 'veryLarge') => {
    if (!isLoading) {
      setDatasetSize(size);
    } else {
      toast({
        title: 'Loading in progress',
        description: 'Please wait for the current dataset to finish loading before switching.',
      });
    }
  }, [isLoading, toast]);

  /**
   * Get the appropriate dataset based on selected size
   */
  const getDatasetBySize = useCallback(() => {
    switch (datasetSize) {
      case 'large':
        return mockLargeLineageData;
      case 'veryLarge':
        return mockVeryLargeLineageData;
      default:
        return mockLineageData;
    }
  }, [datasetSize]);

  return {
    datasetSize,
    isLoading,
    setIsLoading,
    setDatasetSize: setDatasetSizeHandler,
    getDatasetBySize
  };
}
