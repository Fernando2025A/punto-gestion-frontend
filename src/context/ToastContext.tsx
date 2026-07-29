import { createContext } from "react";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error", duration?: number) => void;
  hideToast: () => void;
}
export const ToastContext = createContext<ToastContextType | undefined>(undefined);