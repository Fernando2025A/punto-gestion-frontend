import React, { useEffect, useState } from "react";
import { X, PackagePlus, DollarSign, Layers, Tag, Truck, Calendar } from "lucide-react";
import { SupplierSelect } from "../../SupplierSelect/SupplierSelect";
import "./ProductModal.css";

export type ProductCategory =
  | "ELECTRONICS"
  | "CLOTHING"
  | "FOOD"
  | "BOOKS"
  | "FURNITURE"
  | "TOYS"
  | "SPORTS"
  | "OTHERS";

export interface ProductFormData {
  id?: number;
  name: string;
  price: number | "";
  purchasePrice: number | "";
  stock: number | "";
  minimumStock: number | "";
  category: ProductCategory;
  supplierId?: number;
  expirationDate?: string; // 👈 Campo opcional para fecha de vencimiento
}

export interface ProductSubmitOptions {
  keepOpen: boolean;
  keepData: boolean;
}

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    productData: ProductFormData,
    options: ProductSubmitOptions
  ) => Promise<boolean | void> | boolean | void;
  isLoading?: boolean;
}

const CATEGORIES: ProductCategory[] = [
  "FOOD",
  "ELECTRONICS",
  "CLOTHING",
  "BOOKS",
  "FURNITURE",
  "TOYS",
  "SPORTS",
  "OTHERS",
];

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  FOOD: "Alimentos (FOOD)",
  ELECTRONICS: "Electrónica (ELECTRONICS)",
  CLOTHING: "Ropa y Calzado (CLOTHING)",
  BOOKS: "Libros (BOOKS)",
  FURNITURE: "Muebles (FURNITURE)",
  TOYS: "Juguetes (TOYS)",
  SPORTS: "Deportes (SPORTS)",
  OTHERS: "Otros (OTHERS)",
};

const INITIAL_FORM: ProductFormData = {
  name: "",
  price: "",
  purchasePrice: "",
  stock: "",
  minimumStock: "",
  category: "FOOD",
  supplierId: undefined,
  expirationDate: "",
};

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ProductModalProps) {
  // 🔒 Bloquear el scroll del cuerpo de la página cuando el modal está abierto
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

  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);
  const [showSupplier, setShowSupplier] = useState<boolean>(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});

  const [keepOpen, setKeepOpen] = useState(false);
  const [keepData, setKeepData] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          name === "price" || name === "purchasePrice" || name === "stock"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      };

      // Si la categoría cambia y deja de ser FOOD, limpiamos expirationDate
      if (name === "category" && value !== "FOOD") {
        updated.expirationDate = "";
      }

      return updated;
    });

    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSupplierChange = (supplierId: number) => {
    setFormData((prev) => ({
      ...prev,
      supplierId,
    }));
  };

  const toggleSupplierSelect = () => {
    if (showSupplier) {
      setFormData((prev) => ({ ...prev, supplierId: undefined }));
    }
    setShowSupplier(!showSupplier);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es obligatorio.";
    }

    if (formData.price === "" || Number(formData.price) <= 0) {
      newErrors.price = "El precio debe ser mayor a 0.";
    }

    if (formData.purchasePrice === "" || Number(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = "El precio de compra debe ser mayor a 0.";
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      newErrors.stock = "El stock debe ser igual o mayor a 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit(formData, { keepOpen, keepData });

    if (success !== false) {
      if (!keepData) {
        setFormData(INITIAL_FORM);
        setShowSupplier(false);
      }
      if (!keepOpen) {
        onClose();
      }
    }
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div
        className="product-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Header */}
        <div className="product-modal-header">
          <div className="product-modal-title-wrapper">
            <div className="product-modal-icon-bg">
              <PackagePlus size={22} className="product-modal-icon" />
            </div>
            <div>
              <h3 id="product-modal-title" className="product-modal-title">
                Agregar Nuevo Producto
              </h3>
              <p className="product-modal-subtitle">
                Ingresa los datos del producto para sumar a tu inventario.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="product-modal-close-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="product-modal-form">
          {/* Nombre */}
          <div className="product-form-group">
            <label htmlFor="name">Nombre del producto</label>
            <div className="product-input-wrapper">
              <Tag size={18} className="product-input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Ej. Jamón cocido"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.name ? "input-error" : ""}
              />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Precios y Stock */}
          <div className="product-form-row">
            <div className="product-form-group">
              <label htmlFor="price">Precio de venta ($)</label>
              <div className="product-input-wrapper">
                <DollarSign size={18} className="product-input-icon" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="2300"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.price ? "input-error" : ""}
                />
              </div>
              {errors.price && (
                <span className="error-text">{errors.price}</span>
              )}
            </div>

            <div className="product-form-group">
              <label htmlFor="purchasePrice">Precio de compra ($)</label>
              <div className="product-input-wrapper">
                <DollarSign size={18} className="product-input-icon" />
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  placeholder="1800"
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.purchasePrice ? "input-error" : ""}
                />
              </div>
              {errors.purchasePrice && (
                <span className="error-text">{errors.purchasePrice}</span>
              )}
            </div>

            <div className="product-form-group">
              <label htmlFor="stock">Stock inicial</label>
              <div className="product-input-wrapper">
                <Layers size={18} className="product-input-icon" />
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  placeholder="55"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.stock ? "input-error" : ""}
                />
              </div>
              {errors.stock && (
                <span className="error-text">{errors.stock}</span>
              )}
            </div>
          </div>

          <div className="product-form-group">
              <label htmlFor="minimumStock">Alerta de stock</label>
              <div className="product-input-wrapper">
                <Layers size={18} className="product-input-icon" />
                <input
                  type="number"
                  id="minimumStock"
                  name="minimumStock"
                  placeholder="10"
                  min="0"
                  step="1"
                  value={formData.minimumStock}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.minimumStock ? "input-error" : ""}
                />
              </div>
              {errors.minimumStock && (
                <span className="error-text">{errors.minimumStock}</span>
              )}
          </div>

          {/* Categoría */}
          <div className="product-form-group">
            <label htmlFor="category">Categoría</label>
            <div className="product-input-wrapper">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isLoading}
                className="product-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 📅 Selector de Fecha de Vencimiento (Solo cuando category === 'FOOD') */}
          {formData.category === "FOOD" && (
            <div className="product-form-group">
              <label htmlFor="expirationDate">
                Fecha de vencimiento <span style={{ color: "#64748b" }}>(Opcional)</span>
              </label>
              <div className="product-input-wrapper">
                <Calendar size={18} className="product-input-icon" />
                <input
                  type="date"
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Sección de Proveedor (Opcional) */}
          <div className="product-form-group">
            <button
              type="button"
              className="btn-toggle-supplier"
              onClick={toggleSupplierSelect}
              disabled={isLoading}
            >
              <Truck size={16} />
              {showSupplier
                ? "Quitar proveedor opcional"
                : "+ Seleccionar proveedor (Opcional)"}
            </button>

            {showSupplier && (
              <div className="supplier-select-container">
                <SupplierSelect
                  value={formData.supplierId}
                  onChange={handleSupplierChange}
                  disabled={isLoading}
                  label="Proveedor asignado"
                />
              </div>
            )}
          </div>

          {/* Opciones adicionales */}
          <div className="product-modal-options">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={keepOpen}
                onChange={(e) => setKeepOpen(e.target.checked)}
                disabled={isLoading}
              />
              <span>No cerrar el formulario</span>
            </label>

            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={keepData}
                onChange={(e) => setKeepData(e.target.checked)}
                disabled={isLoading}
              />
              <span>No limpiar los campos</span>
            </label>
          </div>

          {/* Acciones */}
          <div className="product-modal-actions">
            <button
              type="button"
              className="btn-product-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-product-submit"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}