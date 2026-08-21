import { useState, useEffect } from "react";
import "./PasswordChangeConfirmationModal.css";
import { useToast } from "../../../hooks/useToast"; // Ajusta la ruta según tu proyecto

interface PasswordChangeConfirmationModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function PasswordChangeConfirmationModal({
  isOpen,
  userEmail,
  onClose,
  onConfirm,
}: PasswordChangeConfirmationModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteConfirmation = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      showToast("Código de verificación enviado con éxito", "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Ocurrió un error al enviar el código", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cryptographic-modal-overlay-backdrop" onClick={onClose}>
      <div
        className="cryptographic-modal-content-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cryptographic-modal-header-section">
          <h3 className="cryptographic-modal-title-heading">
            Confirmación de Seguridad
          </h3>
          <button
            type="button"
            className="cryptographic-modal-close-trigger"
            onClick={onClose}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <div className="cryptographic-modal-body-wrapper">
          <p className="cryptographic-verification-message-paragraph">
            Estás a punto de cambiar tu contraseña. Se enviará un código de
            verificación a <strong className="cryptographic-target-email-highlight">{userEmail}</strong> para
            confirmar. ¿Continuar?
          </p>

          <div className="cryptographic-modal-actions-footer">
            <button
              type="button"
              className="cryptographic-action-button cryptographic-secondary-dismiss-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="cryptographic-action-button cryptographic-primary-accept-btn"
              onClick={handleExecuteConfirmation}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando código..." : "Sí, continuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}