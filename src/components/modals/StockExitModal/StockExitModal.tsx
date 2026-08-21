import React, { useState, useEffect, useCallback } from "react";
import "./StockExitModal.css";
// Nota: Asegúrate de tener estas importaciones correctas en tu proyecto
import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../../hooks/useAuth";

export interface Product {
  id: string | number;
  name: string;
  stock: number;
  price: number;
  category?: string;
}

export type MovementReason =
  | "SALE"
  | "WASTE"
  | "DAMAGED"
  | "LOSS"
  | "INTERNAL_USE"
  | "PURCHASE"
  | "RETURN"
  | "ADJUSTMENT";

export type PaymentMethod = "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "TRANSFER" | "OTHER";

const REASON_LABELS: Record<MovementReason, string> = {
  SALE: "Venta de producto",
  WASTE: "Merma / Desperdicio / Vencimiento",
  DAMAGED: "Producto dañado o roto",
  LOSS: "Pérdida / Robo / Faltante",
  INTERNAL_USE: "Uso interno del negocio",
  PURCHASE: "Compra a proveedor",
  RETURN: "Devolución de cliente",
  ADJUSTMENT: "Ajuste de inventario",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  DEBIT_CARD: "Tarjeta de Débito",
  CREDIT_CARD: "Tarjeta de Crédito",
  TRANSFER: "Transferencia",
  OTHER: "Otro",
};

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

// Interfaz para manejar el estado de las selecciones múltiples
interface BulkItem {
  product: Product;
  quantity: number;
}

export interface StockExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Se actualiza para soportar envíos tanto unitarios como múltiples[cite: 1, 2]
  onSubmit?: (
    productsData: { product: Product; quantity: number }[],
    reason: MovementReason,
    paymentMethod?: PaymentMethod,
    notes?: string
  ) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export function StockExitModal({
  isOpen,
  onClose,
  onSubmit,
}: StockExitModalProps) {
  const { showToast } = useToast();
  const { user } = useAuth();

  // Estado del Modal (Pestañas)
  const [mode, setMode] = useState<"SINGLE" | "BULK">("SINGLE");

  // Estados de productos y selección
  const [products, setProducts] = useState<Product[]>([]);
  
  // Selección Unitaria[cite: 2]
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | "">("");

  // Selección Múltiple[cite: 1, 2]
  const [bulkSelection, setBulkSelection] = useState<BulkItem[]>([]);

  // Estados de consulta y paginación[cite: 2]
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [paginationInfo, setPaginationInfo] = useState<PaginationMeta | null>(null);

  // Estados del formulario (Compartidos)[cite: 1, 2]
  const [reason, setReason] = useState<MovementReason>("SALE");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState<string>("");

  // Estados de carga y error[cite: 2]
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

  // Petición de datos principal[cite: 2]
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
    [user?.businessId, pageSize]
  );

  // Limpieza al cerrar o refresco al abrir[cite: 2]
  useEffect(() => {
    if (!isOpen) {
      setMode("SINGLE");
      setSelectedProduct(null);
      setBulkSelection([]);
      setSearchQuery("");
      setQuantity("");
      setReason("SALE");
      setPaymentMethod("CASH");
      setNotes("");
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

  // Manejador de selección para Unitaria[cite: 2]
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    if (typeof quantity === "number" && quantity > product.stock) {
      setQuantity(product.stock);
    }
  };

  // Manejador de selección para Múltiple[cite: 1, 2]
  const handleToggleBulkProduct = (product: Product) => {
    setBulkSelection((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Actualizar cantidad de un producto en Múltiple[cite: 1, 2]
  const handleBulkQuantityChange = (productId: string | number, newQuantity: number) => {
    setBulkSelection((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.max(1, Math.min(newQuantity, item.product.stock));
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones Modo Unitario[cite: 2]
    if (mode === "SINGLE") {
      if (!selectedProduct) return showToast("Por favor selecciona un producto.", "error");
      const qtyNumber = Number(quantity);
      if (!qtyNumber || qtyNumber <= 0) return showToast("Ingresa una cantidad válida mayor a 0.", "error");
      if (qtyNumber > selectedProduct.stock) return showToast(`La cantidad excede el stock disponible (${selectedProduct.stock}).`, "error");
    }

    // Validaciones Modo Múltiple[cite: 1, 2]
    if (mode === "BULK") {
      if (bulkSelection.length === 0) return showToast("Debes seleccionar al menos un producto.", "error");
      const invalidItem = bulkSelection.find((item) => item.quantity <= 0 || item.quantity > item.product.stock);
      if (invalidItem) return showToast(`Cantidad inválida para ${invalidItem.product.name}.`, "error");
    }

    try {
      setSubmitting(true);
      const isSingle = mode === "SINGLE";

      // Determinar Endpoint según modo[cite: 1, 2]
      const endpoint = isSingle
        ? `${API_URL}/products/stock-exit?businessId=${user?.businessId}`
        : `${API_URL}/products/stock-exit/bulk/${user?.businessId}`;

      // Construir Payload según modo[cite: 1, 2]
      const payload = isSingle
        ? {
            quantity: Number(quantity),
            productId: selectedProduct?.id,
            reason,
            paymentMethod: reason === "SALE" ? paymentMethod : undefined,
            notes: notes.trim() || undefined,
          }
        : {
            items: bulkSelection.map((item) => ({
              productId: Number(item.product.id),
              quantity: item.quantity,
            })),
            reason,
            paymentMethod: reason === "SALE" ? paymentMethod : undefined,
            notes: notes.trim() || undefined,
          };

      const response = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrar la salida");
      }

      if (onSubmit) {
        const productsData = isSingle
          ? [{ product: selectedProduct!, quantity: Number(quantity) }]
          : bulkSelection;
        onSubmit(
          productsData,
          reason,
          reason === "SALE" ? paymentMethod : undefined,
          notes.trim() || undefined
        );
      }

      showToast(`Salida de stock ${isSingle ? 'unitaria' : 'múltiple'} registrada con éxito`, "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Ocurrió un error al procesar la salida", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dark-modal-overlay" onClick={onClose}>
      <div className="dark-modal-container" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="dark-modal-header">
          <h3>Registrar Salida de Stock</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* --- Pestañas de Modalidad --- */}
        <div style={{ display: 'flex', gap: '1rem', padding: '0 2rem', marginTop: '1rem' }}>
          <button
            type="button"
            className={`btn ${mode === "SINGLE" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setMode("SINGLE")}
          >
            Salida Unitaria
          </button>
          <button
            type="button"
            className={`btn ${mode === "BULK" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setMode("BULK")}
          >
            Salida Múltiple
          </button>
        </div>

        <div className="dark-modal-body">
          <form className="magnification-query-crucible" onSubmit={handleExecuteSearch}>
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
                <button type="submit" className="astral-trigger-button" disabled={loading}>
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
                  const isOutOfStock = product.stock <= 0;
                  
                  // Lógica visual basada en el modo actual[cite: 1, 2]
                  const isSelected = mode === "SINGLE"
                    ? selectedProduct?.id === product.id
                    : bulkSelection.some((item) => item.product.id === product.id);

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${isSelected ? "selected" : ""} ${isOutOfStock ? "out-of-stock" : ""}`}
                      onClick={() => {
                        if (isOutOfStock) return;
                        mode === "SINGLE" ? handleSelectProduct(product) : handleToggleBulkProduct(product);
                      }}
                    >
                      <div className="card-header">
                        <h4>{product.name}</h4>
                        {product.category && <span className="category-badge">{product.category}</span>}
                      </div>
                      <div className="card-body">
                        <p className="price">${product.price.toLocaleString()}</p>
                        <p className={`stock ${isOutOfStock ? "stock-zero" : ""}`}>
                          Stock: <strong>{product.stock}</strong>
                        </p>
                      </div>
                      {isOutOfStock && <div className="stock-warning">Sin Stock</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paginación[cite: 2] */}
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
                  Página <strong>{paginationInfo.page}</strong> de <strong>{paginationInfo.totalPages}</strong>
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

          <form onSubmit={handleSubmit} className="exit-fields-form">
            
            {/* Información del Modo Unitario[cite: 2] */}
            {mode === "SINGLE" && (
              <div className="selected-info">
                {selectedProduct ? (
                  <p>
                    Seleccionado: <span>{selectedProduct.name}</span> | Stock disponible: <strong>{selectedProduct.stock}</strong>
                  </p>
                ) : (
                  <p className="placeholder-text">Ningún producto seleccionado</p>
                )}
              </div>
            )}

            {/* Lista y ajuste de cantidades Modo Múltiple[cite: 1, 2] */}
            {mode === "BULK" && (
              <div className="bulk-selected-info" style={{ marginBottom: '1.5rem', background: 'var(--bg-lighter, #2a2a2a)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>Productos Seleccionados ({bulkSelection.length})</h4>
                {bulkSelection.length === 0 ? (
                  <p className="placeholder-text">No has seleccionado ningún producto.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {bulkSelection.map((item) => (
                      <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.product.name} (Max: {item.product.stock})</span>
                        <input
                          type="number"
                          className="dark-input"
                          style={{ width: '80px', padding: '4px' }}
                          min="1"
                          max={item.product.stock}
                          value={item.quantity}
                          onChange={(e) => handleBulkQuantityChange(item.product.id, Number(e.target.value))}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-row">
              {/* Solo pedimos la cantidad global en modo Unitario[cite: 2] */}
              {mode === "SINGLE" && (
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
                    onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
                    required
                  />
                </div>
              )}

              {/* El motivo aplica para ambos Modos[cite: 1, 2] */}
              <div className="form-group">
                <label htmlFor="modal-reason">Motivo *</label>
                <select
                  id="modal-reason"
                  className="dark-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as MovementReason)}
                  required
                >
                  {(["SALE", "WASTE", "DAMAGED", "LOSS", "INTERNAL_USE"] as MovementReason[]).map((reasonKey) => (
                    <option key={reasonKey} value={reasonKey}>
                      {REASON_LABELS[reasonKey]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              {reason === "SALE" && (
                <div className="form-group">
                  <label htmlFor="modal-payment-method">Método de Pago</label>
                  <select
                    id="modal-payment-method"
                    className="dark-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((methodKey) => (
                      <option key={methodKey} value={methodKey}>
                        {PAYMENT_METHOD_LABELS[methodKey]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="modal-notes">Notas (Opcional)</label>
                <input
                  id="modal-notes"
                  type="text"
                  className="dark-input"
                  placeholder="Detalles o comentarios adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  (mode === "SINGLE" && (!selectedProduct || selectedProduct.stock <= 0 || !quantity)) ||
                  (mode === "BULK" && bulkSelection.length === 0)
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