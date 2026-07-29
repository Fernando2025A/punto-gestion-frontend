import React, { useState, useEffect, useMemo } from "react";
import "./StockExitModal.css";
import { Toast } from "../Toast/Toast";
import { useToast } from "../../hooks/useToast";

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

// Props necesarias para integrarlo en tu página
export interface StockExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (product: Product, quantity: number, reason: string) => void;
}

// URL obtenida desde las variables de entorno de Vite
const API_URL = import.meta.env.VITE_API_URL;

export function StockExitModal({
  isOpen,
  onClose,
  onSubmit,
}: StockExitModalProps) {

  const { showToast } = useToast();
  // Estados de productos
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Estados del formulario
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");

  // Estados de estado y carga
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch de productos SOLO cuando isOpen cambia a true
  useEffect(() => {
    if (!isOpen) {
      // Limpiar datos cuando el modal se cierra
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

  // 2. Filtro en tiempo real por nombre
  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  // 3. Selección de producto
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    if (typeof quantity === "number" && quantity > product.stock) {
      setQuantity(product.stock);
    }
  };

  // 4. Envío del formulario para descontar stock
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

    if (qtyNumber > selectedProduct.stock) {
      showToast(
        `La cantidad excede el stock disponible (${selectedProduct.stock}).`,
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/products/stock-exit`, {
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
        throw new Error(errorData.message || "Error al registrar la salida");
      }

      // Si existe el callback onSubmit provisto por la página padre, se ejecuta
      if (onSubmit) {
        onSubmit(selectedProduct, qtyNumber, reason.trim());
      }

      showToast("Salida de stock registrada con éxito", "success");
      onClose(); // Cerrar el modal al finalizar
    } catch (err: any) {
      showToast(
        err.message || "Ocurrió un error al procesar la salida",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;
  return (
    <div className="dark-modal-overlay" onClick={onClose}>
      <div
        className="dark-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="dark-modal-header">
          <h3>Registrar Salida de Stock</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="dark-modal-body">
          {/* Buscador */}
          <div className="search-group">
            <label htmlFor="modal-search">Buscar Producto</label>
            <input
              id="modal-search"
              type="text"
              className="dark-input"
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
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${isSelected ? "selected" : ""} ${
                        isOutOfStock ? "out-of-stock" : ""
                      }`}
                      onClick={() =>
                        !isOutOfStock && handleSelectProduct(product)
                      }
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
                        <p
                          className={`stock ${isOutOfStock ? "stock-zero" : ""}`}
                        >
                          Stock: <strong>{product.stock}</strong>
                        </p>
                      </div>
                      {isOutOfStock && (
                        <div className="stock-warning">Sin Stock</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="exit-fields-form">
            <div className="selected-info">
              {selectedProduct ? (
                <p>
                  Seleccionado: <span>{selectedProduct.name}</span> | Stock
                  disponible: <strong>{selectedProduct.stock}</strong>
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
                  max={selectedProduct ? selectedProduct.stock : undefined}
                  className="dark-input"
                  placeholder="Ej. 5"
                  value={quantity}
                  disabled={!selectedProduct || selectedProduct.stock <= 0}
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
                  placeholder="Ej. Venta, Mermas, Rotura"
                  value={reason}
                  disabled={!selectedProduct || selectedProduct.stock <= 0}
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
                disabled={
                  !selectedProduct ||
                  selectedProduct.stock <= 0 ||
                  submitting ||
                  !quantity
                }
              >
                {submitting ? "Descontando..." : "Aceptar y Descontar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
