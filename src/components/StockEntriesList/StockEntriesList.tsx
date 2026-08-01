import { useEffect, useState } from 'react';
import { RefreshCw, Search, ArrowDownCircle, Calendar } from 'lucide-react';
import './StockEntriesList.css';

// Interface adaptada al JSON de Entradas de Stock
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

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/movements/stock-entry`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron obtener los datos.`);
      }

      const data: StockEntryMovement[] = await response.json();
      setMovements(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const handleRefresh = () => {
    fetchData();
  };

  // Formato de fecha consistente: "28/07/2026, 02:23 p. m."
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
        <Calendar className="se01-icon-calendar" size={16} />
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
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="se01-panel-toolbar">
        <div className="se01-search-wrapper">
          <Search className="se01-search-icon" size={18} />
          <input type="text" placeholder="Buscar por motivo, ID o detalles..." />
        </div>
      </div>

      {/* Tabla de Movimientos */}
      {movements.length === 0 ? (
        <div className="se01-no-data-panel">No hay registros de entradas de stock.</div>
      ) : (
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
              {movements.map((item) => (
                <tr key={item.id}>
                  {/* Fecha */}
                  <td>{formatDateForDisplay(item.createdAt)}</td>

                  {/* Tipo (Badge Verde para Entrada) */}
                  <td>
                    <span className="se01-badge se01-badge-type-entry">
                      <ArrowDownCircle size={15} /> Entrada
                    </span>
                  </td>

                  {/* Prod ID */}
                  <td>
                    <span className="se01-badge se01-badge-prod-id">#{item.productId}</span>
                  </td>

                  {/* Cantidad (Positiva y en Verde) */}
                  <td>
                    <span className="se01-stock-change-positive">+{item.quantity}</span>
                  </td>

                  {/* Stock Anterior -> Nuevo */}
                  <td>
                    <span className="se01-stock-values">
                      <span className="se01-old-stock">{item.previousStock}</span>
                      <span className="se01-stock-arrow">→</span>
                      <span className="se01-new-stock">{item.newStock}</span>
                    </span>
                  </td>

                  {/* Motivo */}
                  <td>
                    {item.reason ? (
                      <span className="se01-reason-text">{item.reason}</span>
                    ) : (
                      <span className="se01-reason-empty">Sin especificar</span>
                    )}
                  </td>

                  {/* Detalles */}
                  <td>
                    <span className="se01-reason-empty">{item.details ?? '-'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}