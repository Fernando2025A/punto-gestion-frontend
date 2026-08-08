import React, { useState, useEffect, useCallback } from "react";
import "./StockExitModal.css";
import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../../hooks/useAuth";

export interface Product {
  id: string | number;
  name: string;
  stock: number;
  price: number;
  category?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProductsResponse {
  data: Product[];
  pagination?: PaginationMeta;
}

export interface StockExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (product: Product, quantity: number, reason: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export function StockExitModal({
  isOpen,
  onClose,
  onSubmit,
}: StockExitModalProps) {
  const { showToast } = useToast();
  const { user } = useAuth();

  // Estados de productos y selección
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Estados de consulta y paginación
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationMeta | null>(
    null,
  );

  // Estados del formulario
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");

  // Estados de carga y error
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Petición de datos principal (Carga por página o por Búsqueda exacta)
  const fetchProductsData = useCallback(
    async (pageToFetch: number, termToSearch: string) => {
      if (!user?.businessId) return;

      try {
        setLoading(true);
        setError(null);

        let endpointUrl = "";

        const cleanSearch = termToSearch.trim();

        if (cleanSearch.length > 0) {
          // Búsqueda por término específico
          endpointUrl = `${API_URL}/products/${encodeURIComponent(
            cleanSearch,
          )}?businessId=${user.businessId}`;
        } else {
          // Petición paginada por defecto
          endpointUrl = `${API_URL}/products/business/${user.businessId}?page=${pageToFetch}&limit=${pageSize}`;
        }

        const res = await fetch(endpointUrl, { credentials: "include" });

        if (!res.ok) {
          throw new Error("Error al obtener el catálogo de productos");
        }

        const responseJson: ProductsResponse = await res.json();

        // Si la API devuelve un array directo o un objeto con data
        const fetchedList = Array.isArray(responseJson)
          ? responseJson
          : responseJson.data || [];

        setProducts(fetchedList);

        if (responseJson.pagination) {
          setPaginationInfo(responseJson.pagination);
        } else {
          setPaginationInfo(null);
        }
      } catch (err: any) {
        setError(err.message || "No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    },
    [user?.businessId, pageSize],
  );

  // Limpieza al cerrar o refresco al abrir
  useEffect(() => {
    if (!isOpen) {
      setSelectedProduct(null);
      setSearchQuery("");
      setQuantity("");
      setReason("");
      setError(null);
      setCurrentPage(1);
      return;
    }

    fetchProductsData(1, "");
  }, [isOpen, fetchProductsData]);

  // Manejador del botón de búsqueda
  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProductsData(1, searchQuery);
  };

  // Cambio de página en el paginador
  const handlePageTransition = (newPage: number) => {
    if (newPage < 1) return;
    if (paginationInfo && newPage > paginationInfo.totalPages) return;
    setCurrentPage(newPage);
    fetchProductsData(newPage, searchQuery);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    if (typeof quantity === "number" && quantity > product.stock) {
      setQuantity(product.stock);
    }
  };

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
        "error",
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/products/stock-exit?businessId=${user?.businessId}`,
        {
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
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrar la salida");
      }

      if (onSubmit) {
        onSubmit(selectedProduct, qtyNumber, reason.trim());
      }

      showToast("Salida de stock registrada con éxito", "success");
      onClose();
    } catch (err: any) {
      showToast(
        err.message || "Ocurrió un error al procesar la salida",
        "error",
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
        <div className="dark-modal-header">
          <h3>Registrar Salida de Stock</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="dark-modal-body">
          {/* Formulario de Búsqueda con Nombres Rebuscados */}
          <form
            className="magnification-query-crucible"
            onSubmit={handleExecuteSearch}
          >
            <div className="search-group">
              <label htmlFor="modal-search">Buscar Producto</label>
              <div className="quantum-search-container">
                <input
                  id="modal-search"
                  type="text"
                  className="dark-input nexus-filtering-field"
                  placeholder="Escribe el nombre del producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="astral-trigger-button"
                  disabled={loading}
                >
                  {loading ? "Indagando..." : "Buscar"}
                </button>
              </div>
            </div>
          </form>

          {/* Listado de Tarjetas */}
          <div className="cards-section">
            <span className="section-label">Seleccionar Producto</span>

            {loading ? (
              <div className="dark-loading">Cargando catálogo...</div>
            ) : error ? (
              <div className="dark-error">{error}</div>
            ) : products.length === 0 ? (
              <div className="no-results">No se encontraron productos</div>
            ) : (
              <div className="cards-grid">
                {products.map((product) => {
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
                          className={`stock ${
                            isOutOfStock ? "stock-zero" : ""
                          }`}
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

            {/* Paginador con Nombres Rebuscados */}
            {paginationInfo && paginationInfo.totalPages > 1 && (
              <div className="chronos-pagination-archway">
                <button
                  type="button"
                  className="hyperion-navigator-btn"
                  disabled={!paginationInfo.hasPreviousPage || loading}
                  onClick={() => handlePageTransition(currentPage - 1)}
                >
                  &laquo; Anterior
                </button>

                <span className="celestial-page-indicator">
                  Página <strong>{paginationInfo.page}</strong> de{" "}
                  <strong>{paginationInfo.totalPages}</strong>
                </span>

                <button
                  type="button"
                  className="hyperion-navigator-btn"
                  disabled={!paginationInfo.hasNextPage || loading}
                  onClick={() => handlePageTransition(currentPage + 1)}
                >
                  Siguiente &raquo;
                </button>
              </div>
            )}
          </div>

          {/* Formulario de salida */}
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
