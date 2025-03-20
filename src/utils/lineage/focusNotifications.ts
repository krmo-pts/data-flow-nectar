
import { type ToastProps } from "@/hooks/use-toast";

/**
 * Displays analysis started notification
 */
export const showAnalysisStartedToast = (toast: (props: ToastProps) => void, nodeId: string) => {
  toast({
    title: 'Impact Analysis',
    description: `Analyzing dependencies for node ${nodeId}`,
  });
};

/**
 * Displays analysis in progress notification
 */
export const showAnalysisInProgressToast = (toast: (props: ToastProps) => void) => {
  toast({
    title: 'Analysis in progress',
    description: 'Please wait for the current analysis to complete',
  });
};
