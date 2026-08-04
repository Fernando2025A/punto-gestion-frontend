import { useEffect, useState } from 'react';
import { RefreshCw, Search, ArrowDownCircle, Calendar, Package } from 'lucide-react';
import './StockEntriesList.css';

export interface StockEntryMovement {
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

export function StockEntriesList() {
  const [movements, setMovements] = useState<StockEntryMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const apiUrl = import.meta.env.VITE_API_URL;

  // Función reutilizable para el botón "Actualizar"
const handleRefresh = () => {
  fetchData();
};

const fetchData = async (signal?: AbortSignal) => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(`${apiUrl}/movements/stock-entry`, {
      credentials: 'include',
      signal, // Permite cancelar la petición si el componente se desmonta
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener los datos.`);
    }

    const data: StockEntryMovement[] = await response.json();
    setMovements(data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Ignoramos el error si fue causado por abortar la petición
      if (err.name === 'AbortError') return;
      setError(err.message);
    } else {
      setError('Ocurrió un error desconocido.');
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const controller = new AbortController();

  // Ejecutamos la carga dentro del efecto enviando el signal
  fetchData(controller.signal);

  // Función de limpieza para cancelar peticiones pendientes
  return () => {
    controller.abort();
  };
}, [apiUrl]);

  // Filtrado simple en memoria por término de búsqueda
  const filteredMovements = movements.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.reason?.toLowerCase().includes(term) ||
      item.details?.toLowerCase().includes(term) ||
      item.productId.toString().includes(term) ||
      item.id.toString().includes(term)
    );
  });

  const formatDateForDisplay = (isoString: string) => {
    const date = new Date(isoString);

    const datePart = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const timePart = date
      .toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase()
      .replace('am', 'a. m.')
      .replace('pm', 'p. m.');

    return (
      <div className="se01-date-cell">
        <Calendar className="se01-icon-calendar" size={15} />
        <span>
          {datePart}, {timePart}
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className="se01-loading-panel">Cargando entradas de stock...</div>;
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
          <p>Auditoría e historial de reabastecimiento e ingreso de inventario.</p>
        </div>
        <button className="se01-btn-actualizar" onClick={handleRefresh}>
          <RefreshCw size={16} /> <span>Actualizar</span>
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Estado Vacio */}
      {filteredMovements.length === 0 ? (
        <div className="se01-no-data-panel">
          {searchTerm ? 'No se encontraron resultados.' : 'No hay registros de entradas de stock.'}
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
                  <th>Detalles</th>
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
                      <span className="se01-badge se01-badge-prod-id">#{item.productId}</span>
                    </td>
                    <td>
                      <span className="se01-stock-change-positive">+{item.quantity}</span>
                    </td>
                    <td>
                      <span className="se01-stock-values">
                        <span className="se01-old-stock">{item.previousStock}</span>
                        <span className="se01-stock-arrow">→</span>
                        <span className="se01-new-stock">{item.newStock}</span>
                      </span>
                    </td>
                    <td>
                      {item.reason ? (
                        <span className="se01-reason-text">{item.reason}</span>
                      ) : (
                        <span className="se01-reason-empty">Sin especificar</span>
                      )}
                    </td>
                    <td>
                      <span className="se01-reason-empty">{item.details ?? '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista para Mobile (Tarjetas Verticals) */}
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
                  <span className="se01-stock-change-positive">+{item.quantity}</span>
                </div>

                <div className="se01-card-body">
                  <div className="se01-card-row">
                    <span className="se01-card-label">Motivo:</span>
                    <span className="se01-card-value">
                      {item.reason ? item.reason : <i className="se01-reason-empty">Sin especificar</i>}
                    </span>
                  </div>

                  <div className="se01-card-row">
                    <span className="se01-card-label">Stock:</span>
                    <div className="se01-stock-values">
                      <span className="se01-old-stock">{item.previousStock}</span>
                      <span className="se01-stock-arrow">→</span>
                      <span className="se01-new-stock">{item.newStock}</span>
                    </div>
                  </div>

                  {item.details && (
                    <div className="se01-card-row">
                      <span className="se01-card-label">Detalles:</span>
                      <span className="se01-card-value">{item.details}</span>
                    </div>
                  )}
                </div>

                <div className="se01-card-footer">
                  {formatDateForDisplay(item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}