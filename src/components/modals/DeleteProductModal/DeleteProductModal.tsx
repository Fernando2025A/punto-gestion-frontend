import { AlertTriangle, X } from "lucide-react";
import { type Product } from "../../../pages/Products/ProductsPage/ProductsPage";
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
    <div className="delete-product-modal-overlay" onClick={onClose}>
      <div
        className="delete-product-modal-container"
        onClick={(e) => e.stopPropagation()} // Previene cerrar al hacer clic dentro
      >
        {/* Botón de Cierre Superior */}
        <button className="delete-product-modal-close-btn" onClick={onClose} disabled={isDeleting}>
          <X size={18} />
        </button>

        {/* Icono de Advertencia */}
        <div className="delete-product-modal-icon-wrapper">
          <AlertTriangle size={28} className="delete-product-modal-icon" />
        </div>

        {/* Contenido Principal */}
        <div className="delete-product-modal-content">
          <h2 className="delete-product-modal-title">¿Eliminar producto?</h2>
          <p className="delete-product-modal-description">
            Estás a punto de eliminar el producto{" "}
            <strong className="delete-product-modal-highlight">{product.name}</strong> (ID: #{product.id}).
            Esta acción no se puede deshacer.
          </p>

          {/* Resumen del Producto */}
          <div className="delete-product-modal-product-summary">
            <div className="delete-product-modal-summary-item">
              <span className="delete-product-modal-summary-label">Categoría:</span>
              <span className="delete-product-modal-summary-value">{product.category}</span>
            </div>
            <div className="delete-product-modal-summary-item">
              <span className="delete-product-modal-summary-label">Stock actual:</span>
              <span className="delete-product-modal-summary-value">{product.stock} unidades</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="delete-product-modal-actions">
          <button
            className="delete-product-modal-btn-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            className="delete-product-modal-btn-delete-confirm"
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