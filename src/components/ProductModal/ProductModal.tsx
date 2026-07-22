import React, { useState } from "react";
import { X, PackagePlus, DollarSign, Layers, Tag } from "lucide-react";
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
  name: string;
  price: number | "";
  stock: number | "";
  category: ProductCategory;
}

// Opciones adicionales para controlar el comportamiento tras guardar
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
  stock: "",
  category: "FOOD",
};

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  
  // Estados para las dos nuevas opciones
  const [keepOpen, setKeepOpen] = useState(false);
  const [keepData, setKeepData] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));

    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es obligatorio.";
    }

    if (formData.price === "" || Number(formData.price) <= 0) {
      newErrors.price = "El precio debe ser mayor a 0.";
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

    // Enviamos los datos y las opciones al padre
    const success = await onSubmit(formData, { keepOpen, keepData });

    // Si la petición fue exitosa, aplicamos las reglas de "limpiar"
    if (success !== false && !keepData) {
      setFormData(INITIAL_FORM);
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

          {/* Precio y Stock */}
          <div className="product-form-row">
            <div className="product-form-group">
              <label htmlFor="price">Precio ($)</label>
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
              {errors.price && <span className="error-text">{errors.price}</span>}
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
              {errors.stock && <span className="error-text">{errors.stock}</span>}
            </div>
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

          {/* Opciones adicionales: No cerrar / No limpiar */}
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