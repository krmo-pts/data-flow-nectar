
import * as React from "react"
import { State } from "./types"
import { listeners, memoryState, dispatch } from "./reducer"
import { toast } from "./toast-utils"

// Main useToast hook that provides toast state and actions
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

// Re-export toast function and hook
export { useToast, toast }
