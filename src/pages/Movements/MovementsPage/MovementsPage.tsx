import { useEffect, useState, useCallback } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  RefreshCw,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./MovementsPage.css";
import { useAuth } from "../../../hooks/useAuth";

// --- Tipos de datos según Backend ---
export type MovementType =
  | "ALL"
  | "STOCK_ENTRY"
  | "STOCK_EXIT"
  | "CREATE_PRODUCT"
  | "UPDATE_PRODUCT"
  | "DELETE_PRODUCT";

export interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface Movement {
  id: number;
  type: MovementType;
  quantity: number | null;
  previousStock: number | null;
  newStock: number | null;
  reason: string | null;
  details: Record<string, { from?: unknown; to?: unknown }> | string | null;
  createdAt: string;
  inventoryId: number;
  productId: number | null;
  userId: string;
}

export interface APIResponse {
  data: Movement[];
  pagination: PaginationData;
}

export function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 8,
    totalItems: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  // Filtros locales
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Obtener movimientos desde la API
  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (selectedType !== "ALL") {
        params.append("movementType", selectedType);
      }

      const response = await fetch(`${apiUrl}/movements/${user?.businessId}?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error al cargar los movimientos");

      const result: APIResponse = await response.json();

      setMovements(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado"
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, currentPage, limit, selectedType]);

  useEffect(() => {
  let isMounted = true;

  const loadMovements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (selectedType !== "ALL") {
        params.append("movementType", selectedType);
      }

      const response = await fetch(`${apiUrl}/movements/${user?.businessId}?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error al cargar los movimientos");

      const result: APIResponse = await response.json();

      // Solo actualizamos el estado si el componente sigue montado
      if (isMounted) {
        setMovements(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
    } catch (err) {
      if (isMounted) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error inesperado"
        );
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  loadMovements();

  return () => {
    isMounted = false; // Cleanup flag
  };
}, [apiUrl, currentPage, limit, selectedType, user?.businessId]);

  // Resetear a la primera página al cambiar el tipo de filtro
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  // Helper para renderizar Badge
  const renderTypeBadge = (type: MovementType) => {
    switch (type) {
      case "STOCK_ENTRY":
        return (
          <span className="movement-badge badge-entry">
            <ArrowDownCircle size={14} /> Entrada
          </span>
        );
      case "STOCK_EXIT":
        return (
          <span className="movement-badge badge-exit">
            <ArrowUpCircle size={14} /> Salida
          </span>
        );
      case "CREATE_PRODUCT":
        return (
          <span className="movement-badge badge-create">
            <PlusCircle size={14} /> Creado
          </span>
        );
      case "UPDATE_PRODUCT":
        return (
          <span className="movement-badge badge-update">
            <Edit3 size={14} /> Edición
          </span>
        );
      case "DELETE_PRODUCT":
        return (
          <span className="movement-badge badge-delete">
            <Trash2 size={14} /> Eliminado
          </span>
        );
      default:
        return <span className="movement-badge">{type}</span>;
    }
  };

  // Helper para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Helper adaptado para soportar string, object o null en `details`
  const renderDetails = (movement: Movement) => {
    if (!movement.details) return <span className="text-muted">-</span>;

    // Si viene como texto plano
    if (typeof movement.details === "string") {
      return <span>{movement.details}</span>;
    }

    // Si es un objeto de actualizaciones (UPDATE_PRODUCT)
    if (movement.type === "UPDATE_PRODUCT") {
      return (
        <div className="movement-details-box">
          {Object.entries(movement.details).map(([key, value]) => (
            <div key={key} className="detail-item">
              <strong>{key}:</strong>{" "}
              {value?.from !== null && value?.from !== undefined ? (
                <span className="detail-from">{String(value.from)}</span>
              ) : null}
              {value?.from !== null && value?.from !== undefined ? " ➔ " : ""}
              <span className="detail-to">{String(value?.to ?? "")}</span>
            </div>
          ))}
        </div>
      );
    }

    // Si es una eliminación (DELETE_PRODUCT)
    if (movement.type === "DELETE_PRODUCT") {
      // Indicamos a TS la forma exacta de los detalles para este tipo de movimiento
      const detailsObj = movement.details as {
        deletedProductName?: string;
        deletedProductPrice?: number | string;
      };

      const name = detailsObj.deletedProductName;
      const price = detailsObj.deletedProductPrice;

      return (
        <div className="movement-details-box">
          {name && (
            <div>
              <strong>Nombre:</strong> {name}
            </div>
          )}
          {price !== undefined && price !== null && (
            <div>
              <strong>Precio:</strong> ${String(price)}
            </div>
          )}
        </div>
      );
    }

    return (
      <span className="text-muted">{JSON.stringify(movement.details)}</span>
    );
  };

  // Búsqueda local sobre el lote de la página actual
  const filteredMovements = movements.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.id.toString().includes(search) ||
      (item.reason && item.reason.toLowerCase().includes(search)) ||
      (item.productId && item.productId.toString().includes(search)) ||
      (item.details &&
        JSON.stringify(item.details).toLowerCase().includes(search))
    );
  });

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="movements-container">
      {/* Header */}
      <div className="movements-header">
        <div>
          <h1 className="movements-title">Historial de Movimientos</h1>
          <p className="movements-subtitle">
            Auditoría de entradas, salidas y cambios en el inventario.
          </p>
        </div>
        <button
          type="button"
          className="btn-refresh"
          disabled={isLoading}
          onClick={fetchMovements}
        >
          <RefreshCw size={16} className={isLoading ? "spin" : ""} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Controles y Filtros */}
      <div className="movements-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por motivo, ID o detalles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="filter-select"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="STOCK_ENTRY">Entradas de Stock</option>
            <option value="STOCK_EXIT">Salidas de Stock</option>
            <option value="CREATE_PRODUCT">Creación de Producto</option>
            <option value="UPDATE_PRODUCT">Ediciones</option>
            <option value="DELETE_PRODUCT">Eliminaciones</option>
          </select>
        </div>
      </div>

      {/* Estado de Carga o Error */}
      {isLoading ? (
        <div className="movements-state-card">
          <RefreshCw size={32} className="spin icon-state" />
          <p>Cargando registro de movimientos...</p>
        </div>
      ) : error ? (
        <div className="movements-state-card error">
          <Info size={32} className="icon-state" />
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchMovements}>
            Reintentar
          </button>
        </div>
      ) : filteredMovements.length === 0 ? (
        <div className="movements-state-card">
          <Info size={32} className="icon-state" />
          <p>
            No se encontraron movimientos registrados con los filtros aplicados.
          </p>
        </div>
      ) : (
        /* Tabla de Movimientos */
        <>
          <div className="movements-table-wrapper">
            <table className="movements-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Tipo</th>
                  <th>Prod ID</th>
                  <th>Cantidad</th>
                  <th>Stock Anterior / Nuevo</th>
                  <th>Motivo</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((item) => (
                  <tr key={item.id}>
                    <td className="cell-date" data-label="Fecha y Hora">
                      <Calendar size={14} />
                      <span>{formatDate(item.createdAt)}</span>
                    </td>
                    <td data-label="Tipo">{renderTypeBadge(item.type)}</td>
                    <td data-label="Prod ID">
                      {item.productId ? (
                        <span className="product-id-tag">#{item.productId}</span>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td className="cell-quantity" data-label="Cantidad">
                      {item.quantity !== null ? (
                        <span
                          className={
                            item.type === "STOCK_EXIT"
                              ? "qty-negative"
                              : item.type === "STOCK_ENTRY"
                              ? "qty-positive"
                              : ""
                          }
                        >
                          {item.type === "STOCK_EXIT"
                            ? `-${item.quantity}`
                            : item.quantity}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td
                      className="cell-stock"
                      data-label="Stock Anterior / Nuevo"
                    >
                      <Layers size={14} className="text-muted" />
                      <span>{item.previousStock ?? "-"}</span>
                      <span className="stock-arrow">➔</span>
                      <strong>{item.newStock ?? "-"}</strong>
                    </td>
                    <td className="cell-reason" data-label="Motivo">
                      {item.reason && item.reason.trim() !== "" ? (
                        item.reason
                      ) : (
                        <span className="text-muted">Sin especificar</span>
                      )}
                    </td>
                    <td className="cell-details" data-label="Detalles">
                      {renderDetails(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Componente Paginador conectado a `pagination` del backend */}
          <div className="pagination-container-movement">
            <span className="pagination-info-movement">
              Página <strong>{pagination.page}</strong> de{" "}
              <strong>{pagination.totalPages}</strong> ({pagination.totalItems} registros en total)
            </span>

            <div className="pagination-actions-movement">
              <button
                type="button"
                className="btn-pagination-movement"
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isLoading}
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
                <span>Anterior</span>
              </button>

              <button
                type="button"
                className="btn-pagination-movement"
                onClick={handleNextPage}
                disabled={currentPage >= pagination.totalPages || isLoading}
                aria-label="Página siguiente"
              >
                <span>Siguiente</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}