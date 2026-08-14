import React, { useState, useEffect } from "react";
import { X, KeyRound, Loader2, Building2 } from "lucide-react";
import "./AddBusinessModal.css";

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [accessCode, setAccessCode] = useState<string>("");

  // Limpia el input cuando el modal se abre o cierra
  useEffect(() => {
    if (!isOpen) {
      setAccessCode("");
    }
  }, [isOpen]);

  // Cierre al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedCode = accessCode.trim();
    if (!trimmedCode || isLoading) return;

    await onSubmit(trimmedCode);
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="add-business-modal-backdrop-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="add-business-modal-content-container">
        {/* Cabecera del Modal */}
        <div className="add-business-modal-header-wrapper">
          <div className="add-business-modal-header-title-group">
            <div className="add-business-modal-header-icon-badge">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="add-business-modal-main-title">
                Unirse a un Negocio
              </h2>
              <p className="add-business-modal-subtitle">
                Ingresa el código de invitación o acceso proporcionado.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="add-business-modal-close-icon-button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form
          className="add-business-modal-form-element"
          onSubmit={handleSubmitForm}
        >
          <div className="add-business-modal-input-field-group">
            <label
              htmlFor="add-business-access-code-input"
              className="add-business-modal-input-label"
            >
              Código de Acceso
            </label>
            <div className="add-business-modal-input-wrapper">
              <KeyRound
                className="add-business-modal-input-left-icon"
                size={18}
              />
              <input
                id="add-business-access-code-input"
                type="text"
                className="add-business-modal-text-input"
                placeholder="Ej. BIZ-8942-X"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                disabled={isLoading}
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          {/* Acciones/Botones del Footer */}
          <div className="add-business-modal-actions-footer">
            <button
              type="button"
              className="add-business-modal-cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="add-business-modal-submit-confirm-button"
              disabled={!accessCode.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="add-business-modal-spinner-animation"
                  />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Confirmar código</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusinessModal;