
import { NodeData, EdgeData } from '@/types/lineage';

/**
 * Handles closing a panel with a delay to allow for animation
 * @param setIsOpen Function to set panel open state
 * @param setData Function to clear data after animation
 */
export const closePanelWithAnimation = (
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setData: React.Dispatch<React.SetStateAction<any>>
) => {
  // Close panel first
  setIsOpen(false);
  
  // Clear data after animation completes
  setTimeout(() => {
    setData(null);
  }, 300);
};

/**
 * Checks if a node/edge is already selected to prevent unnecessary re-renders
 * @param currentId Current selected item ID
 * @param newId New item ID being selected
 * @param isOpen Current panel open state
 * @returns Whether the selection should be skipped
 */
export const shouldSkipSelection = (
  currentId: string | undefined | null,
  newId: string,
  isOpenRef: React.MutableRefObject<boolean>
): boolean => {
  return isOpenRef.current && currentId === newId;
};
