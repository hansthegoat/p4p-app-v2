import { t as toast } from "../_libs/sonner.mjs";
const showToast = {
  success: (message, description) => {
    toast.success(message, {
      description,
      duration: 4e3
    });
  },
  error: (message, description) => {
    toast.error(message, {
      description,
      duration: 5e3
    });
  },
  warning: (message, description) => {
    toast.warning(message, {
      description,
      duration: 4e3
    });
  },
  info: (message, description) => {
    toast.info(message, {
      description,
      duration: 3e3
    });
  },
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error
    });
  }
};
export {
  showToast as s
};
