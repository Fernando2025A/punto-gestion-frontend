import { useState } from "react";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";
import "./DeleteSupplierModal.css";

export interface DeleteSupplierModalProps {
  isOpen: boolean;
  supplierName: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean | void> | boolean | void;
}

export function DeleteSupplierModal({
  isOpen,
  supplierName,
  isLoading = false,
  onClose,
  onConfirm,
}: DeleteSupplierModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      const result = await onConfirm();
      // Si la función retorna algo distinto de false, cerramos el modal
      if (result !== false) {
        handleClose();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al intentar eliminar el distribuidor."
      );
    }
  };

  return (
    <div className="delsupmodal-overlay" onClick={handleClose}>
      <div
        className="delsupmodal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delsupmodal-title"
      >
        {/* Header */}
        <div className="delsupmodal-header">
          <div className="delsupmodal-title-wrapper">
            <div className="delsupmodal-warning-icon">
              <AlertTriangle size={22} />
            </div>
            <h2 id="delsupmodal-title" className="delsupmodal-title">
              Eliminar Distribuidor
            </h2>
          </div>
          <button
            type="button"
            className="delsupmodal-btn-close"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="delsupmodal-body">
          {error && <div className="delsupmodal-error-banner">{error}</div>}

          <p className="delsupmodal-text">
            ¿Estás seguro de que deseas eliminar a{" "}
            <strong className="delsupmodal-supplier-name">
              "{supplierName}"
            </strong>
            ?
          </p>
          <p className="delsupmodal-subtext">
            Esta acción es irreversible y podría afectar los productos vinculados a este distribuidor.
          </p>
        </div>

        {/* Footer / Acciones */}
        <div className="delsupmodal-footer">
          <button
            type="button"
            className="delsupmodal-btn-cancel"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="delsupmodal-btn-delete"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="delsupmodal-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Sí, Eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}