import React, { useState, useEffect, useMemo } from "react";
import "./StockEntryModal.css";
import { useToast } from "../../../hooks/useToast";

// Interface para el modelo de Producto
export interface Product {
  id: string | number;
  name: string;
  stock: number;
  price: number;
  category?: string;
}

interface ProductsResponse {
  data: Product[];
}

// Props del Modal
export interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (product: Product, quantity: number, reason: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export function StockEntryModal({
  isOpen,
  onClose,
  onSubmit,
}: StockEntryModalProps) {
  const { showToast } = useToast();

  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reset y Fetch de productos al abrir el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedProduct(null);
      setSearchQuery("");
      setQuantity("");
      setReason("");
      setError(null);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/products`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Error al obtener los productos");
        }

        const responseJson: ProductsResponse = await res.json();
        setProducts(responseJson.data);
      } catch (err: any) {
        setError(err.message || "No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isOpen]);

  // Filtro de productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Seleccionar producto (Permite seleccionar incluso si stock es 0)
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Submit para ingresar stock
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      showToast("Por favor selecciona un producto.", "error");
      return;
    }

    const qtyNumber = Number(quantity);
    if (!qtyNumber || qtyNumber <= 0) {
      showToast("Ingresa una cantidad válida mayor a 0.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/products/stock-entry`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: qtyNumber,
          productId: selectedProduct.id,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrar la entrada");
      }

      if (onSubmit) {
        onSubmit(selectedProduct, qtyNumber, reason.trim());
      }

      showToast("Entrada de stock registrada con éxito", "success");
      onClose();
    } catch (err: any) {
      showToast(
        err.message || "Ocurrió un error al procesar la entrada",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dark-modal-overlay" onClick={onClose}>
      <div
        className="dark-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="dark-modal-header">
          <h3>Registrar Entrada de Stock</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Cuerpo */}
        <div className="dark-modal-body">
          {/* Buscador */}
          <div className="search-group">
            <input
              type="text"
              className="dark-input search-input"
              placeholder="Escribe el nombre del producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tarjetas de Productos */}
          <div className="cards-section">
            <span className="section-label">Seleccionar Producto</span>

            {loading ? (
              <div className="dark-loading">Cargando productos...</div>
            ) : error ? (
              <div className="dark-error">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-results">No se encontraron productos</div>
            ) : (
              <div className="cards-grid">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="card-header">
                        <h4>{product.name}</h4>
                        {product.category && (
                          <span className="category-badge">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <div className="card-body">
                        <p className="price">
                          ${product.price.toLocaleString()}
                        </p>
                        <p className="stock">
                          Stock: <strong>{product.stock}</strong>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="entry-fields-form">
            <div className="selected-info">
              {selectedProduct ? (
                <p>
                  Seleccionado: <span>{selectedProduct.name}</span> | Stock
                  actual: <strong>{selectedProduct.stock}</strong>
                </p>
              ) : (
                <p className="placeholder-text">Ningún producto seleccionado</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modal-quantity">Cantidad *</label>
                <input
                  id="modal-quantity"
                  type="number"
                  min="1"
                  className="dark-input"
                  placeholder="Ej. 5"
                  value={quantity}
                  disabled={!selectedProduct}
                  onChange={(e) =>
                    setQuantity(e.target.value ? Number(e.target.value) : "")
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-reason">Motivo / Notas</label>
                <input
                  id="modal-reason"
                  type="text"
                  className="dark-input"
                  placeholder="Ej. Compra a proveedor, Reabastecimiento"
                  value={reason}
                  disabled={!selectedProduct}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedProduct || submitting || !quantity}
              >
                {submitting ? "Ingresando..." : "Aceptar e Ingresar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}