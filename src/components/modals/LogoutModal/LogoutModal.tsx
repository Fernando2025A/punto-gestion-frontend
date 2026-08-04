import React from "react";
import "./LogoutModal.css";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div
        className="logout-modal-container"
        onClick={(e) => e.stopPropagation()} // Evita cerrar el modal al hacer clic dentro
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <div className="logout-modal-icon-container">
          <svg
            className="logout-modal-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h3 id="logout-title" className="logout-modal-title">
          ¿Cerrar sesión?
        </h3>
        <p className="logout-modal-description">
          ¿Estás seguro de que deseas salir de Punto Gestión? Tendrás que volver a ingresar tus credenciales para acceder.
        </p>

        <div className="logout-modal-actions">
          <button
            type="button"
            className="logout-modal-btn-cancel"
            onClick={onClose}
            disabled={isLoggingOut}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="logout-modal-btn-confirm"
            onClick={onConfirm}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Cerrando..." : "Sí, cerrar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}