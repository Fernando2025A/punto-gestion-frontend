import React, {  useState, useCallback } from "react";
import { Toast, type ToastProps } from "../components/Toast/Toast"; // Ajusta la ruta a tu componente
import { ToastContext } from "../context/ToastContext";


export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastState, setToastState] = useState<Omit<ToastProps, "onClose">>({
    isOpen: false,
    message: "",
    type: "success",
    duration: 3500,
  });

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success", duration = 3500) => {
      setToastState({
        isOpen: true,
        message,
        type,
        duration,
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* El Toast se renderiza globalmente aquí una sola vez */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        duration={toastState.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}
