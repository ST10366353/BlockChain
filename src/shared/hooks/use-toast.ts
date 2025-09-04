"use client"

import React from "react"

export interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  toasts: Toast[]
}

let toastCount = 0

export const useToast = () => {
  const [state, setState] = React.useState<ToastState>({ toasts: [] })

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = (++toastCount).toString()
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    }

    setState((prevState) => ({
      toasts: [...prevState.toasts, newToast],
    }))

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setState((prevState) => ({
      toasts: prevState.toasts.filter((toast) => toast.id !== id),
    }))
  }, [])

  const clearToasts = React.useCallback(() => {
    setState({ toasts: [] })
  }, [])

  // Convenience methods
  const toastSuccess = React.useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        title,
        description,
        type: "success",
        ...options,
      })
    },
    [addToast],
  )

  const toastError = React.useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        title,
        description,
        type: "error",
        ...options,
      })
    },
    [addToast],
  )

  const toastWarning = React.useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        title,
        description,
        type: "warning",
        ...options,
      })
    },
    [addToast],
  )

  const toastInfo = React.useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        title,
        description,
        type: "info",
        ...options,
      })
    },
    [addToast],
  )

  return {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearToasts,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
  }
}
