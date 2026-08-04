import React, { useState } from "react";
import { X, Building2, UserCheck, Loader2 } from "lucide-react";
import "./SupplierModal.css";

export interface SupplierFormData {
  name: string;
  contact?: string;
}

export interface SupplierModalProps {
  title?: string;
  supplier?: SupplierFormData | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onSubmit: (data: SupplierFormData) => Promise<boolean | void> | boolean | void;
}

export function SupplierModal({
  title,
  supplier,
  isOpen,
  onClose,
  isLoading = false,
  onSubmit,
}: SupplierModalProps) {
  const [name, setName] = useState(supplier?.name ?? "");
  const [contact, setContact] = useState(supplier?.contact ?? "");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setContact("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("El nombre del distribuidor es obligatorio.");
      return;
    }

    setError(null);

    try {
      const result = await onSubmit({
        name: name.trim(),
        contact: contact.trim() ? contact.trim() : undefined,
      });

      if (result !== false) {
        handleClose();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el distribuidor"
      );
    }
  };

  const modalTitle =
    title ?? (supplier ? "Editar Distribuidor" : "Nuevo Distribuidor");

  return (
    <div className="supmodal-overlay" onClick={handleClose}>
      <div
        className="supmodal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="supmodal-title"
      >
        {/* Header */}
        <div className="supmodal-header">
          <div className="supmodal-title-wrapper">
            <Building2 className="supmodal-icon" size={22} />
            <h2 id="supmodal-title" className="supmodal-title">
              {modalTitle}
            </h2>
          </div>
          <button
            type="button"
            className="supmodal-btn-close"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="supmodal-form">
          {error && <div className="supmodal-error-banner">{error}</div>}

          <div className="supmodal-field">
            <label htmlFor="supplier-name" className="supmodal-label">
              Nombre del Distribuidor <span className="supmodal-required">*</span>
            </label>
            <input
              id="supplier-name"
              type="text"
              className="supmodal-input"
              placeholder="Ej. Distribuidora Mayorista S.A."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="supmodal-field">
            <label htmlFor="supplier-contact" className="supmodal-label">
              Contacto <span className="supmodal-optional">(Opcional)</span>
            </label>
            <input
              id="supplier-contact"
              type="text"
              className="supmodal-input"
              placeholder="Ej. Juan Pérez / +54 9 11 1234-5678"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Footer */}
          <div className="supmodal-footer">
            <button
              type="button"
              className="supmodal-btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="supmodal-btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="supmodal-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>Guardar Distribuidor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}