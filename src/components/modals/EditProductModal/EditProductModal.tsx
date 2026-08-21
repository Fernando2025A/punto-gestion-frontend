import React, { useState, useEffect } from "react";
import { X, Pencil, DollarSign, Layers, Tag, Image as ImageIcon } from "lucide-react";
import './EditProductModal.css';
import type { ProductFormData } from "../ProductModal/ProductModal";

export type ProductCategory =
  | "ELECTRONICS"
  | "CLOTHING"
  | "FOOD"
  | "BOOKS"
  | "FURNITURE"
  | "TOYS"
  | "SPORTS"
  | "OTHERS";

export interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    updatedData: ProductFormData
  ) => Promise<boolean | void> | boolean | void;
  product: (ProductFormData & { imageUrl?: string }) | null;
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

export function EditProductModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
}: EditProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    id: 1,
    name: "",
    price: "",
    purchasePrice: "",
    minimumStock: 1,
    stock: "",
    category: "FOOD",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});

  // Cargar datos del producto actual cuando cambia la prop
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id ?? 1,
        name: product.name ?? "",
        price: product.price ?? "",
        purchasePrice: product.purchasePrice ?? "",
        stock: product.stock ?? "",
        expirationDate: product.expirationDate ?? "",
        minimumStock: product.minimumStock ?? "",
        category: product.category || "FOOD",
        imageFile: null,
      });

      // Priorizar la previsualización existente
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      } else {
        setImagePreview(null);
      }
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "purchasePrice" || name === "stock" || name === "minimumStock"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));

    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null }));
    setImagePreview(null);
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

    if (formData.minimumStock !== "" && Number(formData.minimumStock) < 0) {
      newErrors.minimumStock = "La alerta de stock debe ser igual o mayor a 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit(formData);

    if (success !== false) {
      onClose();
    }
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div
        className="product-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-modal-title"
      >
        {/* Header */}
        <div className="product-modal-header">
          <div className="product-modal-title-wrapper">
            <div className="product-modal-icon-bg">
              <Pencil size={22} className="product-modal-icon" />
            </div>
            <div>
              <h3 id="edit-product-modal-title" className="product-modal-title">
                Editar Producto
              </h3>
              <p className="product-modal-subtitle">
                Modifica los datos del producto seleccionado para actualizar el inventario.
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
            <label htmlFor="edit-name">Nombre del producto</label>
            <div className="product-input-wrapper">
              <Tag size={18} className="product-input-icon" />
              <input
                type="text"
                id="edit-name"
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

          {/* Precios y Alerta Stock */}
          <div className="product-form-row">
            <div className="product-form-group">
              <label htmlFor="edit-price">Precio de venta ($)</label>
              <div className="product-input-wrapper">
                <DollarSign size={18} className="product-input-icon" />
                <input
                  type="number"
                  id="edit-price"
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
              <label htmlFor="edit-purchasePrice">Precio de compra ($)</label>
              <div className="product-input-wrapper">
                <DollarSign size={18} className="product-input-icon" />
                <input
                  type="number"
                  id="edit-purchasePrice"
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
              <label htmlFor="edit-minimumStock">Alerta de stock</label>
              <div className="product-input-wrapper">
                <Layers size={18} className="product-input-icon" />
                <input
                  type="number"
                  id="edit-minimumStock"
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
          </div>

          {/* Categoría */}
          <div className="product-form-group">
            <label htmlFor="edit-category">Categoría</label>
            <div className="product-input-wrapper">
              <select
                id="edit-category"
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

          {/* 🖼️ Campo para Editar Imagen */}
          <div className="product-form-group">
            <label htmlFor="edit-imageFile">
              Imagen del producto <span style={{ color: "#64748b" }}>(Opcional)</span>
            </label>
            <div className="product-image-upload-wrapper">
              {imagePreview ? (
                <div className="product-image-preview-container">
                  <img src={imagePreview} alt="Vista previa" className="product-image-preview" />
                  <button
                    type="button"
                    className="product-image-remove-btn"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label htmlFor="edit-imageFile" className="product-image-dropzone">
                  <ImageIcon size={24} className="product-image-icon" />
                  <span>Subir nueva imagen (PNG, JPG)</span>
                  <input
                    type="file"
                    id="edit-imageFile"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="product-hidden-file-input"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <p className="footer-info-icon-badge-edit">
              ⓘ Los ajustes de stock se deben registrar en entradas/salidas.
            </p>
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
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}