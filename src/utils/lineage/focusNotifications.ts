
import { Toast } from "@/components/ui/use-toast";

/**
 * Displays analysis started notification
 */
export const showAnalysisStartedToast = (toast: Toast, nodeId: string) => {
  toast({
    title: 'Impact Analysis',
    description: `Analyzing dependencies for node ${nodeId}`,
  });
};

/**
 * Displays analysis in progress notification
 */
export const showAnalysisInProgressToast = (toast: Toast) => {
  toast({
    title: 'Analysis in progress',
    description: 'Please wait for the current analysis to complete',
  });
};
