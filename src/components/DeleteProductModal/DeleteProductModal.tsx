import { AlertTriangle, X } from "lucide-react";
import { type Product } from "../ProductsPage/ProductsPage";
import "./DeleteProductModal.css";

interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: number) => Promise<void> | void;
  isDeleting?: boolean;
}

export function DeleteProductModal({
  isOpen,
  product,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteProductModalProps) {
  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    onConfirm(product.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // Previene cerrar al hacer clic dentro
      >
        {/* Botón de Cierre Superior */}
        <button className="modal-close-btn" onClick={onClose} disabled={isDeleting}>
          <X size={18} />
        </button>

        {/* Icono de Advertencia */}
        <div className="modal-icon-wrapper">
          <AlertTriangle size={28} className="modal-icon" />
        </div>

        {/* Contenido Principal */}
        <div className="modal-content">
          <h2 className="modal-title">¿Eliminar producto?</h2>
          <p className="modal-description">
            Estás a punto de eliminar el producto{" "}
            <strong className="modal-highlight">{product.name}</strong> (ID: #{product.id}).
            Esta acción no se puede deshacer.
          </p>

          {/* Resumen del Producto */}
          <div className="modal-product-summary">
            <div className="summary-item">
              <span className="summary-label">Categoría:</span>
              <span className="summary-value">{product.category}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Stock actual:</span>
              <span className="summary-value">{product.stock} unidades</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            className="btn-delete-confirm"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}