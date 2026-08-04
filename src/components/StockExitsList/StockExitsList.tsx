import { useEffect, useState } from "react";
import {
  RefreshCw,
  ArrowUpCircle,
  Calendar,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./StockExitsList.css";

export interface StockExitMovement {
  id: number;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  details: string | null;
  createdAt: string;
  inventoryId: number;
  productId: number;
  userId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface StockExitPaginatedResponse {
  data: StockExitMovement[];
  pagination: PaginationMeta;
}

const ITEMS_PER_PAGE = 5;

export function StockExitsList() {
  const [movements, setMovements] = useState<StockExitMovement[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const apiUrl = import.meta.env.VITE_API_URL;

  // Resetear a la página 1 al cambiar el filtro de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 1. Carga inicial y reactiva mediante useEffect (server-side pagination + search)
  useEffect(() => {
    const controller = new AbortController();

    async function fetchStockExits() {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
        });

        const response = await fetch(
          `${apiUrl}/movements/stock-exit?${queryParams.toString()}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error ${response.status}: No se pudieron obtener los datos.`
          );
        }

        const responseData: StockExitPaginatedResponse = await response.json();
        setMovements(responseData.data);
        setPaginationMeta(responseData.pagination);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === "AbortError") return;
          setError(err.message);
        } else {
          setError("Ocurrió un error desconocido.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStockExits();

    return () => {
      controller.abort();
    };
  }, [apiUrl, currentPage, searchTerm]);

  // 2. Función independiente para recargas manuales (botón Actualizar / Reintentar)
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      });

      const response = await fetch(
        `${apiUrl}/movements/stock-exit?${queryParams.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudieron obtener los datos.`
        );
      }

      const responseData: StockExitPaginatedResponse = await response.json();
      setMovements(responseData.data);
      setPaginationMeta(responseData.pagination);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (isoString: string) => {
    const date = new Date(isoString);

    const datePart = date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const timePart = date
      .toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase()
      .replace("am", "a. m.")
      .replace("pm", "p. m.");

    return (
      <div className="se02-date-cell">
        <Calendar className="se02-icon-calendar" size={15} />
        <span>
          {datePart}, {timePart}
        </span>
      </div>
    );
  };

  if (loading && movements.length === 0) {
    return (
      <div className="se02-stock-exits-loading-panel">
        Cargando historial de salidas de stock...
      </div>
    );
  }

  if (error && movements.length === 0) {
    return (
      <div className="se02-stock-exits-error-panel">
        <p>Error: {error}</p>
        <button className="se02-btn-actualizar" onClick={handleRefresh}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="se02-stock-history-panel">
      {/* Encabezado */}
      <div className="se02-panel-header">
        <div className="se02-title-group">
          <h2>Salidas de Stock</h2>
          <p>Auditoría e historial de egresos y despasante de inventario.</p>
        </div>
        <button className="se02-btn-actualizar" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
          <span>{loading ? "Cargando..." : "Actualizar"}</span>
        </button>
      </div>

      {/* Toolbar / Búsqueda */}
      <div className="se02-panel-toolbar">
        <div className="se02-search-wrapper">
          <Search className="se02-search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar por motivo, ID o detalles..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Estado Vacío */}
      {!loading && movements.length === 0 ? (
        <div className="se02-no-data-panel">
          {searchTerm
            ? "No se encontraron resultados coincidentes."
            : "No hay registros de salidas de stock."}
        </div>
      ) : (
        <>
          {/* Vista Desktop (Tabla) */}
          <div className="se02-table-wrapper">
            <table className="se02-history-table">
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
                {movements.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateForDisplay(item.createdAt)}</td>
                    <td>
                      <span className="se02-badge se02-badge-type-exit">
                        <ArrowUpCircle size={15} /> Salida
                      </span>
                    </td>
                    <td>
                      <span className="se02-badge se02-badge-prod-id">
                        #{item.productId}
                      </span>
                    </td>
                    <td>
                      <span className="se02-stock-change-negative">
                        -{item.quantity}
                      </span>
                    </td>
                    <td>
                      <span className="se02-stock-values">
                        <span className="se02-old-stock">{item.previousStock}</span>
                        <span className="se02-stock-arrow">→</span>
                        <span className="se02-new-stock">{item.newStock}</span>
                      </span>
                    </td>
                    <td>
                      {item.reason ? (
                        <span className="se02-reason-text">{item.reason}</span>
                      ) : (
                        <span className="se02-reason-empty">Sin especificar</span>
                      )}
                    </td>
                    <td>
                      <span className="se02-reason-empty">
                        {item.details ?? "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Mobile (Tarjetas) */}
          <div className="se02-cards-wrapper">
            {movements.map((item) => (
              <div key={item.id} className="se02-card-item">
                <div className="se02-card-header">
                  <div className="se02-card-badges">
                    <span className="se02-badge se02-badge-type-exit">
                      <ArrowUpCircle size={14} /> Salida
                    </span>
                    <span className="se02-badge se02-badge-prod-id">
                      <Package size={14} /> #{item.productId}
                    </span>
                  </div>
                  <span className="se02-stock-change-negative">
                    -{item.quantity}
                  </span>
                </div>

                <div className="se02-card-body">
                  <div className="se02-card-row">
                    <span className="se02-card-label">Motivo:</span>
                    <span className="se02-card-value">
                      {item.reason ? (
                        item.reason
                      ) : (
                        <i className="se02-reason-empty">Sin especificar</i>
                      )}
                    </span>
                  </div>

                  <div className="se02-card-row">
                    <span className="se02-card-label">Flujo Stock:</span>
                    <div className="se02-stock-values">
                      <span className="se02-old-stock">{item.previousStock}</span>
                      <span className="se02-stock-arrow">→</span>
                      <span className="se02-new-stock">{item.newStock}</span>
                    </div>
                  </div>

                  {item.details && (
                    <div className="se02-card-row">
                      <span className="se02-card-label">Detalles:</span>
                      <span className="se02-card-value">{item.details}</span>
                    </div>
                  )}
                </div>

                <div className="se02-card-footer">
                  {formatDateForDisplay(item.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          <div className="se02-pagination-container">
            <span className="se02-pagination-info">
              Página <strong>{paginationMeta.page}</strong> de <strong>{paginationMeta.totalPages}</strong> ({paginationMeta.totalItems} registros)
            </span>

            <div className="se02-pagination-controls">
              <button
                className="se02-pagination-btn"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="se02-pagination-btn"
                disabled={currentPage === paginationMeta.totalPages || loading}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, paginationMeta.totalPages)
                  )
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StockExitsList;