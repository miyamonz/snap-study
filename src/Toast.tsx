import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { getDefaultStore } from "jotai/vanilla";

// Define the type for a toast message
export type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number; // Duration in milliseconds
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const toastsAtom = atom<Toast[]>([]);
const toastDuration = 2000;

// Toast function to add a new toast
export function toast(
  message: string,
  type: Toast["type"] = "info",
  duration = toastDuration
) {
  const store = getDefaultStore();

  const newToast: Toast = {
    id: generateId(),
    message,
    type,
    duration,
  };

  store.set(toastsAtom, (prev) => [...prev, newToast]);

  // Automatically remove the toast after duration
  setTimeout(() => {
    store.set(toastsAtom, (prev) =>
      prev.filter((toast) => toast.id !== newToast.id)
    );
  }, duration);

  return newToast.id;
}

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
