// src/lib/toast.ts

import { toast } from "sonner";

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description: description,
      duration: 4000,
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description: description,
      duration: 5000,
    });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description: description,
      duration: 4000,
    });
  },
  info: (message: string, description?: string) => {
    toast.info(message, {
      description: description,
      duration: 3000,
    });
  },
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};