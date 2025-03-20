
import { Toast, State, StateCreator, ToasterToast, ToastActionType } from "./types"

// Set maximum number of toasts
const TOAST_LIMIT = 20

// Array to store update listeners
export const listeners: StateCreator[] = []

// Initial state
export const memoryState: State = { toasts: [] }

// Dispatch function to modify toast state
export function dispatch(action: ToastActionType) {
  memoryState.toasts = reducer(memoryState.toasts, action)
  listeners.forEach((listener) => {
    listener({ ...memoryState })
  })
}

// Reducer function for handling toast actions
function reducer(toasts: ToasterToast[], action: ToastActionType): ToasterToast[] {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast, ...toasts].slice(0, TOAST_LIMIT)

    case "UPDATE_TOAST":
      return toasts.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      )

    case "DISMISS_TOAST": {
      const { toastId } = action

      // If no ID is specified, dismiss all toasts
      if (toastId === undefined) {
        return toasts.map((t) => ({
          ...t,
          open: false,
        }))
      }

      // Find the toast by ID and dismiss it
      return toasts.map((t) =>
        t.id === toastId ? { ...t, open: false } : t
      )
    }

    case "REMOVE_TOAST": {
      const { toastId } = action

      // If no ID is specified, remove all closed toasts
      if (toastId === undefined) {
        return toasts.filter((t) => t.open !== false)
      }

      // Remove by ID
      return toasts.filter((t) => t.id !== toastId)
    }
  }
}
