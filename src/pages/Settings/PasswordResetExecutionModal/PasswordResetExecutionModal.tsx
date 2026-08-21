import React, { useState } from "react";
import "./PasswordResetExecutionModal.css";
import { useToast } from "../../../hooks/useToast";

interface PasswordResetExecutionModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onSubmit: (verificationCode: string, newPassword: string) => Promise<void> | void;
}

export function PasswordResetExecutionModal({
  isOpen,
  userEmail,
  onClose,
  onSubmit,
}: PasswordResetExecutionModalProps) {
  const { showToast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      showToast("Por favor ingresa el código de verificación", "error");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showToast("La nueva contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(verificationCode.trim(), newPassword);
      showToast("Contraseña actualizada con éxito", "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Ocurrió un error al actualizar la contraseña", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cryptographic-reset-modal-overlay-backdrop" onClick={onClose}>
      <div
        className="cryptographic-reset-modal-content-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cryptographic-reset-modal-header-section">
          <h3 className="cryptographic-reset-modal-title-heading">
            Restablecer Contraseña
          </h3>
          <button
            type="button"
            className="cryptographic-reset-modal-close-trigger"
            onClick={onClose}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleFormSubmission} className="cryptographic-reset-modal-form-wrapper">
          <p className="cryptographic-reset-instruction-paragraph">
            Introduce el código de verificación enviado a <strong className="cryptographic-reset-email-highlight">{userEmail}</strong> y define tu nueva clave de acceso.
          </p>

          <div className="cryptographic-reset-form-group">
            <label htmlFor="modal-verification-code" className="cryptographic-reset-input-label">
              Código de Verificación *
            </label>
            <input
              id="modal-verification-code"
              type="text"
              className="cryptographic-reset-text-input"
              placeholder="Ej. 123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="cryptographic-reset-form-group">
            <label htmlFor="modal-new-password" className="cryptographic-reset-input-label">
              Nueva Contraseña *
            </label>
            <input
              id="modal-new-password"
              type="password"
              className="cryptographic-reset-text-input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="cryptographic-reset-modal-actions-footer">
            <button
              type="button"
              className="cryptographic-reset-action-button cryptographic-reset-secondary-dismiss-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="cryptographic-reset-action-button cryptographic-reset-primary-accept-btn"
              disabled={isSubmitting || !verificationCode || !newPassword}
            >
              {isSubmitting ? "Actualizando..." : "Establecer contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}