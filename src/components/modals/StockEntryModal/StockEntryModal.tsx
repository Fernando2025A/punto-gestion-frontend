import React, { useState, useEffect, useCallback } from "react";
import "./StockEntryModal.css";
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

// Estructura interna para manejar el estado múltiple, soportando unitCost según el DTO[cite: 4]
interface BulkEntryItem {
  product: Product;
  quantity: number;
  unitCost?: number | "";
}

export interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Actualizado para devolver un arreglo y soportar ambos flujos[cite: 3, 4]
  onSubmit?: (
    productsData: { product: Product; quantity: number; unitCost?: number }[],
    reason: string
  ) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export function StockEntryModal({
  isOpen,
  onClose,
  onSubmit,
}: StockEntryModalProps) {
  const { showToast } = useToast();
  const { user } = useAuth();

  // Estado del Modal (Pestañas)[cite: 3]
  const [mode, setMode] = useState<"SINGLE" | "BULK">("SINGLE");

  // Estados de productos y selección[cite: 3]
  const [products, setProducts] = useState<Product[]>([]);
  
  // Selección Unitaria
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Selección Múltiple[cite: 4]
  const [bulkSelection, setBulkSelection] = useState<BulkEntryItem[]>([]);

  // Estados de búsqueda y paginación[cite: 3]
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationMeta | null>(null);

  // Estados del formulario (Compartidos)[cite: 3]
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");

  // Estados de carga y error
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchProductsData = useCallback(
    async (pageToFetch: number, termToSearch: string) => {
      if (!user?.businessId) return;

      try {
        setLoading(true);
        setError(null);

        let endpointUrl = "";
        const cleanSearch = termToSearch.trim();

        if (cleanSearch.length > 0) {
          endpointUrl = `${API_URL}/products/${encodeURIComponent(cleanSearch)}?businessId=${user.businessId}`;
        } else {
          endpointUrl = `${API_URL}/products/business/${user.businessId}?page=${pageToFetch}&limit=${pageSize}`;
        }

        const res = await fetch(endpointUrl, { credentials: "include" });

        if (!res.ok) {
          throw new Error("Error al obtener el catálogo de productos");
        }

        const responseJson: ProductsResponse = await res.json();
        const fetchedList = Array.isArray(responseJson) ? responseJson : responseJson.data || [];

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
    [user?.businessId, pageSize]
  );

  useEffect(() => {
    if (!isOpen) {
      setMode("SINGLE");
      setSelectedProduct(null);
      setBulkSelection([]);
      setSearchQuery("");
      setQuantity("");
      setReason("");
      setError(null);
      setCurrentPage(1);
      return;
    }
    fetchProductsData(1, "");
  }, [isOpen, fetchProductsData]);

  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProductsData(1, searchQuery);
  };

  const handlePageTransition = (newPage: number) => {
    if (newPage < 1) return;
    if (paginationInfo && newPage > paginationInfo.totalPages) return;
    setCurrentPage(newPage);
    fetchProductsData(newPage, searchQuery);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Agregar o remover un producto en el modo Bulk[cite: 4]
  const handleToggleBulkProduct = (product: Product) => {
    setBulkSelection((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      return [...prev, { product, quantity: 1, unitCost: "" }];
    });
  };

  // Actualizar la cantidad o el costo unitario de un item específico en Bulk[cite: 4]
  const handleBulkItemChange = (
    productId: string | number,
    field: "quantity" | "unitCost",
    value: number | ""
  ) => {
    setBulkSelection((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones Modo Unitario[cite: 3]
    if (mode === "SINGLE") {
      if (!selectedProduct) return showToast("Por favor selecciona un producto.", "error");
      const qtyNumber = Number(quantity);
      if (!qtyNumber || qtyNumber <= 0) return showToast("Ingresa una cantidad válida mayor a 0.", "error");
    }

    // Validaciones Modo Múltiple[cite: 4]
    if (mode === "BULK") {
      if (bulkSelection.length === 0) return showToast("Debes seleccionar al menos un producto.", "error");
      const invalidItem = bulkSelection.find((item) => item.quantity <= 0);
      if (invalidItem) return showToast(`La cantidad debe ser mayor a 0 para ${invalidItem.product.name}.`, "error");
    }

    try {
      setSubmitting(true);
      const isSingle = mode === "SINGLE";

      // Determinar Endpoint según modo[cite: 3, 4]
      const endpoint = isSingle
        ? `${API_URL}/products/stock-entry?businessId=${user?.businessId}`
        : `${API_URL}/products/stock-entry/bulk/${user?.businessId}`;

      // Construir Payload adaptado al BulkStockEntryDto[cite: 4]
      const payload = isSingle
        ? {
            quantity: Number(quantity),
            productId: selectedProduct?.id,
            notes: reason.trim() || undefined,
          }
        : {
            items: bulkSelection.map((item) => ({
              productId: Number(item.product.id),
              quantity: Number(item.quantity),
              unitCost: item.unitCost !== "" ? Number(item.unitCost) : undefined,
            })),
            notes: reason.trim() || undefined,
          };

      const response = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrar la entrada");
      }

      if (onSubmit) {
        const productsData = isSingle
          ? [{ product: selectedProduct!, quantity: Number(quantity) }]
          : bulkSelection.map((item) => ({
              product: item.product,
              quantity: Number(item.quantity),
              unitCost: item.unitCost !== "" ? Number(item.unitCost) : undefined,
            }));
        onSubmit(productsData, reason.trim());
      }

      showToast(`Entrada de stock ${isSingle ? "unitaria" : "múltiple"} registrada con éxito`, "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Ocurrió un error al procesar la entrada", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dark-modal-overlay" onClick={onClose}>
      <div className="dark-modal-container" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
        <div className="dark-modal-header">
          <h3>Registrar Entrada de Stock</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Pestañas de Modalidad[cite: 3] */}
        <div style={{ display: "flex", gap: "1rem", padding: "0 2rem", marginTop: "1rem" }}>
          <button
            type="button"
            className={`btn ${mode === "SINGLE" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setMode("SINGLE")}
          >
            Entrada Unitaria
          </button>
          <button
            type="button"
            className={`btn ${mode === "BULK" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setMode("BULK")}
          >
            Entrada Múltiple
          </button>
        </div>

        <div className="dark-modal-body">
          <form className="ingress-query-sanctuary" onSubmit={handleExecuteSearch}>
            <div className="search-group">
              <label htmlFor="modal-entry-search">Buscar Producto</label>
              <div className="ingress-search-wrapper">
                <input
                  id="modal-entry-search"
                  type="text"
                  className="dark-input ingress-filtering-input"
                  placeholder="Escribe el nombre del producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="portal-fetch-button" disabled={loading}>
                  {loading ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>
          </form>

          <div className="cards-section">
            <span className="section-label">
              {mode === "SINGLE" ? "Seleccionar Producto" : "Seleccionar Múltiples Productos"}
            </span>

            {loading ? (
              <div className="dark-loading">Cargando catálogo...</div>
            ) : error ? (
              <div className="dark-error">{error}</div>
            ) : products.length === 0 ? (
              <div className="no-results">No se encontraron productos</div>
            ) : (
              <div className="cards-grid">
                {products.map((product) => {
                  const isSelected =
                    mode === "SINGLE"
                      ? selectedProduct?.id === product.id
                      : bulkSelection.some((item) => item.product.id === product.id);

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${isSelected ? "selected" : ""}`}
                      onClick={() =>
                        mode === "SINGLE" ? handleSelectProduct(product) : handleToggleBulkProduct(product)
                      }
                    >
                      <div className="card-header">
                        <h4>{product.name}</h4>
                        {product.category && <span className="category-badge">{product.category}</span>}
                      </div>
                      <div className="card-body">
                        <p className="price">${product.price.toLocaleString()}</p>
                        <p className="stock">
                          Stock actual: <strong>{product.stock}</strong>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paginación[cite: 3] */}
            {paginationInfo && paginationInfo.totalPages > 1 && (
              <div className="matrix-pagination-dock">
                <button
                  type="button"
                  className="vector-pager-btn"
                  disabled={!paginationInfo.hasPreviousPage || loading}
                  onClick={() => handlePageTransition(currentPage - 1)}
                >
                  &laquo; Anterior
                </button>
                <span className="nexus-counter-display">
                  Página <strong>{paginationInfo.page}</strong> de <strong>{paginationInfo.totalPages}</strong>
                </span>
                <button
                  type="button"
                  className="vector-pager-btn"
                  disabled={!paginationInfo.hasNextPage || loading}
                  onClick={() => handlePageTransition(currentPage + 1)}
                >
                  Siguiente &raquo;
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="entry-fields-form">
            
            {/* Info Modo Unitario[cite: 3] */}
            {mode === "SINGLE" && (
              <div className="selected-info">
                {selectedProduct ? (
                  <p>
                    Seleccionado: <span>{selectedProduct.name}</span> | Stock actual: <strong>{selectedProduct.stock}</strong>
                  </p>
                ) : (
                  <p className="placeholder-text">Ningún producto seleccionado</p>
                )}
              </div>
            )}

            {/* Lista dinámica Modo Múltiple[cite: 4] */}
            {mode === "BULK" && (
              <div className="bulk-selected-info" style={{ marginBottom: "1.5rem", background: "var(--bg-lighter, #2a2a2a)", padding: "1rem", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 1rem 0" }}>Productos Seleccionados ({bulkSelection.length})</h4>
                {bulkSelection.length === 0 ? (
                  <p className="placeholder-text">No has seleccionado ningún producto.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {bulkSelection.map((item) => (
                      <div key={item.product.id} className="bulk-item-row" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ flex: 1, minWidth: "150px" }}>{item.product.name}</span>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <label style={{ fontSize: "0.85rem", color: "#ccc" }}>Cant:</label>
                          <input
                            type="number"
                            className="dark-input"
                            style={{ width: "80px", padding: "4px" }}
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleBulkItemChange(item.product.id, "quantity", Number(e.target.value))}
                            required
                          />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <label style={{ fontSize: "0.85rem", color: "#ccc" }}>Costo U. (Opc):</label>
                          <input
                            type="number"
                            className="dark-input"
                            style={{ width: "100px", padding: "4px" }}
                            min="0"
                            step="0.01"
                            placeholder="Ej: 15.50"
                            value={item.unitCost}
                            onChange={(e) => handleBulkItemChange(item.product.id, "unitCost", e.target.value === "" ? "" : Number(e.target.value))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-row">
              {/* Solo pedimos cantidad global en Unitario[cite: 3] */}
              {mode === "SINGLE" && (
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
                    onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
                    required
                  />
                </div>
              )}

              {/* Notas compartidas[cite: 3, 4] */}
              <div className="form-group" style={{ flex: mode === "BULK" ? "1 1 100%" : undefined }}>
                <label htmlFor="modal-reason">Motivo / Notas</label>
                <input
                  id="modal-reason"
                  type="text"
                  className="dark-input"
                  placeholder="Ej. Compra a proveedor, Reabastecimiento"
                  value={reason}
                  disabled={mode === "SINGLE" && !selectedProduct}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancelar
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  submitting ||
                  (mode === "SINGLE" && (!selectedProduct || !quantity)) ||
                  (mode === "BULK" && bulkSelection.length === 0)
                }
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