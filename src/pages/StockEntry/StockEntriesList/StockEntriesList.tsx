import { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  ArrowDownCircle,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
} from "lucide-react";
import "./StockEntriesList.css";
import type { MovementReason } from "../../../components/modals/StockExitModal/StockExitModal";
import { StockEntryModal } from "../../../components/modals/StockEntryModal/StockEntryModal";
import { useAuth } from "../../../hooks/useAuth";

export interface StockEntryMovement {
  id: number;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: MovementReason | null;
  notes: string;
  details: string | null;
  createdAt: string;
  inventoryId: number;
  productId: number;
  userId: string;
}

// Estructura que coincide exactamente con el JSON de la API
interface PaginatedResponse {
  data: StockEntryMovement[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export function StockEntriesList() {
  const [movements, setMovements] = useState<StockEntryMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);

  const apiUrl = import.meta.env.VITE_API_URL;
  const { user } = useAuth();

  const handleRefresh = () => {
    fetchData(currentPage);
  };

  const fetchData = async (page: number, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      // Endpoint para entradas de stock con parámetros de paginación
      const response = await fetch(
        `${apiUrl}/movements/stock-entry/${user?.businessId}?page=${page}&limit=${itemsPerPage}`,
        {
          credentials: "include",
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudieron obtener los datos.`,
        );
      }

      const resData = await response.json();

      // Mapeo seguro según la estructura devuelta
      if (Array.isArray(resData)) {
        // Fallback por si en algún caso la API responde un array plano
        setMovements(resData);
        setTotalItems(resData.length);
        setTotalPages(Math.ceil(resData.length / itemsPerPage) || 1);
      } else {
        // Mapeo normal con el objeto "pagination" del backend
        const paginated: PaginatedResponse = resData;
        setMovements(paginated.data || []);
        setTotalPages(paginated.pagination?.totalPages || 1);
        setTotalItems(paginated.pagination?.totalItems || 0);
      }
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
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchDatas = async (page: number, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        // Endpoint para entradas de stock con parámetros de paginación
        const response = await fetch(
          `${apiUrl}/movements/stock-entry/${user?.businessId}?page=${page}&limit=${itemsPerPage}`,
          {
            credentials: "include",
            signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Error ${response.status}: No se pudieron obtener los datos.`,
          );
        }

        const resData = await response.json();

        // Mapeo seguro según la estructura devuelta
        if (Array.isArray(resData)) {
          // Fallback por si en algún caso la API responde un array plano
          setMovements(resData);
          setTotalItems(resData.length);
          setTotalPages(Math.ceil(resData.length / itemsPerPage) || 1);
        } else {
          // Mapeo normal con el objeto "pagination" del backend
          const paginated: PaginatedResponse = resData;
          setMovements(paginated.data || []);
          setTotalPages(paginated.pagination?.totalPages || 1);
          setTotalItems(paginated.pagination?.totalItems || 0);
        }
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
    };
    fetchDatas(currentPage, controller.signal);

    return () => {
      controller.abort();
    };
  }, [apiUrl, currentPage, user?.businessId, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredMovements = movements.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.notes?.toLowerCase().includes(term) ||
      item.details?.toLowerCase().includes(term) ||
      item.productId?.toString().includes(term) ||
      item.id.toString().includes(term)
    );
  });

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
      <div className="se01-date-cell">
        <Calendar className="se01-icon-calendar" size={15} />
        <span>
          {datePart}, {timePart}
        </span>
      </div>
    );
  };

  if (loading && movements.length === 0) {
    return (
      <div className="se01-loading-panel">Cargando entradas de stock...</div>
    );
  }

  if (error) {
    return (
      <div className="se01-error-panel">
        <p>Error: {error}</p>
        <button className="se01-btn-actualizar" onClick={handleRefresh}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="se01-stock-history-panel">
      {/* Encabezado */}
      <div className="se01-panel-header">
        <div className="se01-title-group">
          <h2>Entradas de Stock</h2>
          <p>
            Auditoría e historial de reabastecimiento e ingreso de inventario.
          </p>
        </div>
        <button className="action-card" onClick={() => setIsModalOpen(true)}>
          <div className="action-icon-wrapper green">
            <ArrowDownRight size={22} />
          </div>
          <div className="action-text">
            <span className="action-title">Registrar entrada</span>
            <span className="action-desc">Agregar stock al inventario</span>
          </div>
        </button>
        <button
          className="se01-btn-actualizar"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={loading ? "se01-spin" : ""} size={16} />{" "}
          <span>Actualizar</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="se01-panel-toolbar">
        <div className="se01-search-wrapper">
          <Search className="se01-search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar por motivo, ID o detalles..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Estado Vacío */}
      {filteredMovements.length === 0 ? (
        <div className="se01-no-data-panel">
          {searchTerm
            ? "No se encontraron resultados."
            : "No hay registros de entradas de stock."}
        </div>
      ) : (
        <>
          {/* Vista para Desktop (Tabla) */}
          <div className="se01-table-wrapper">
            <table className="se01-history-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Tipo</th>
                  <th>Prod ID</th>
                  <th>Cantidad</th>
                  <th>Stock Anterior / Nuevo</th>
                  <th>Motivo</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateForDisplay(item.createdAt)}</td>
                    <td>
                      <span className="se01-badge se01-badge-type-entry">
                        <ArrowDownCircle size={15} /> Entrada
                      </span>
                    </td>
                    <td>
                      <span className="se01-badge se01-badge-prod-id">
                        #{item.productId}
                      </span>
                    </td>
                    <td>
                      <span className="se01-stock-change-positive">
                        +{item.quantity}
                      </span>
                    </td>
                    <td>
                      <span className="se01-stock-values">
                        <span className="se01-old-stock">
                          {item.previousStock}
                        </span>
                        <span className="se01-stock-arrow">→</span>
                        <span className="se01-new-stock">{item.newStock}</span>
                      </span>
                    </td>
                    <td>
                      {item.reason ? (
                        <span className="se01-reason-text">{item.reason}</span>
                      ) : (
                        <span className="se01-reason-empty">
                          Sin especificar
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="se01-reason-empty">
                        {item.notes ?? "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista para Mobile (Tarjetas Verticales) */}
          <div className="se01-cards-wrapper">
            {filteredMovements.map((item) => (
              <div key={item.id} className="se01-card-item">
                <div className="se01-card-header">
                  <div className="se01-card-badges">
                    <span className="se01-badge se01-badge-type-entry">
                      <ArrowDownCircle size={14} /> Entrada
                    </span>
                    <span className="se01-badge se01-badge-prod-id">
                      <Package size={14} /> #{item.productId}
                    </span>
                  </div>
                  <span className="se01-stock-change-positive">
                    +{item.quantity}
                  </span>
                </div>

                <div className="se01-card-body">
                  <div className="se01-card-row">
                    <span className="se01-card-label">Motivo:</span>
                    <span className="se01-card-value">
                      {item.reason ? (
                        item.reason
                      ) : (
                        <i className="se01-reason-empty">Sin especificar</i>
                      )}
                    </span>
                  </div>

                  <div className="se01-card-row">
                    <span className="se01-card-label">Stock:</span>
                    <div className="se01-stock-values">
                      <span className="se01-old-stock">
                        {item.previousStock}
                      </span>
                      <span className="se01-stock-arrow">→</span>
                      <span className="se01-new-stock">{item.newStock}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="se01-card-row">
                      <span className="se01-card-label">Notas:</span>
                      <span className="se01-card-value">{item.notes}</span>
                    </div>
                  )}
                </div>

                <div className="se01-card-footer">
                  {formatDateForDisplay(item.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Barra de Paginación */}
          <div className="se01-pagination-container">
            <span className="se01-pagination-info">
              Página <strong>{currentPage}</strong> de{" "}
              <strong>{totalPages}</strong> ({totalItems} registros)
            </span>

            <div className="se01-pagination-controls">
              <button
                className="se01-btn-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                title="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                className="se01-btn-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                title="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
      <StockEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
