import { useEffect, useState } from "react";
import { atom, useAtom, useSetAtom } from "jotai";
import { getDefaultStore } from "jotai/vanilla";

// Define the type for a toast message
export type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number; // Duration in milliseconds
};

// Get the default Jotai store
const toastStore = getDefaultStore();

// Create an atom to store the list of active toasts
const toastsAtom = atom<Toast[]>([]);

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const toastDuration = 2000;

// Toast function to add a new toast
export function toast(
  message: string,
  type: Toast["type"] = "info",
  duration = toastDuration
) {
  // Get the current state from the store
  const currentToasts = toastStore.get(toastsAtom);

  const newToast: Toast = {
    id: generateId(),
    message,
    type,
    duration,
  };

  // Add the new toast to the store
  toastStore.set(toastsAtom, [...currentToasts, newToast]);

  // Automatically remove the toast after duration
  setTimeout(() => {
    const toasts = toastStore.get(toastsAtom);
    toastStore.set(
      toastsAtom,
      toasts.filter((toast) => toast.id !== newToast.id)
    );
  }, duration);

  return newToast.id;
}

// Individual Toast Item Component
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Entry animation
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  // Handle animation before removing
  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300); // Match animation duration
  };

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(handleRemove, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  // Style classes based on toast type
  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  };

  const baseClasses =
    "px-4 py-2 rounded shadow-lg text-white flex justify-between items-center transition-all duration-200 ease-out transform";

  // Tailwind for entry/exit transitions
  const positionClasses = isExiting
    ? "translate-x-full opacity-0"
    : isVisible
    ? "translate-x-0 opacity-100"
    : "translate-x-full opacity-0";

  return (
    <div
      className={`${baseClasses} ${
        typeClasses[toast.type]
      } ${positionClasses} mb-2`}
      role="alert"
    >
      <span>{toast.message}</span>
      <button
        onClick={handleRemove}
        className="ml-4 text-white focus:outline-none hover:text-gray-200"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
}

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useAtom(toastsAtom);

  // Sync with the external store only on mount
  useEffect(() => {
    // Subscribe to the store to get updates for toasts added via the toast() function
    const unsubscribe = toastStore.sub(toastsAtom, () => {
      const storeToasts = toastStore.get(toastsAtom);
      // Only update if there's a difference to avoid unnecessary renders
      if (JSON.stringify(storeToasts) !== JSON.stringify(toasts)) {
        setToasts(storeToasts);
      }
    });

    return unsubscribe;
  }, [setToasts]);

  const removeToast = (id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full">
          <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}

// Hook to use toast inside React components
export function useToast() {
  const setToasts = useSetAtom(toastsAtom);

  return {
    show: (message: string, type: Toast["type"] = "info", duration: number) => {
      const id = generateId();
      const newToast = { id, message, type, duration };

      setToasts((toasts) => [...toasts, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    success: (message: string, duration: number) => {
      return toast(message, "success", duration);
    },
    error: (message: string, duration: number) => {
      return toast(message, "error", duration);
    },
    info: (message: string, duration: number) => {
      return toast(message, "info", duration);
    },
    warning: (message: string, duration: number) => {
      return toast(message, "warning", duration);
    },
    dismiss: (id: string) => {
      setToasts((toasts) => toasts.filter((t) => t.id !== id));
    },
    dismissAll: () => {
      setToasts([]);
    },
  };
}
