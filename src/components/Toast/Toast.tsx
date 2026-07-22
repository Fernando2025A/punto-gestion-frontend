import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import "./Toast.css";

export interface ToastProps {
  message: string;
  type?: "success" | "error";
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // Tiempo en milisegundos (por defecto 3500ms)
}

export function Toast({
  message,
  type = "success",
  isOpen,
  onClose,
  duration = 3500,
}: ToastProps) {
  // Autocerrar el toast después del tiempo definido
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`toast-container toast-${type}`} role="alert">
      <div className="toast-content">
        {type === "success" ? (
          <CheckCircle2 size={20} className="toast-icon" />
        ) : (
          <AlertCircle size={20} className="toast-icon" />
        )}
        <span className="toast-message">{message}</span>
      </div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
}