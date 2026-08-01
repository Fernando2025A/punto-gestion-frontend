import { useEffect, useState } from "react";
// Importamos iconos para un look profesional (npm install react-icons)
import {
  RefreshCw,
  ArrowUpCircle,
  Calendar,
} from "lucide-react";
import "./StockExitsList.css";

// Interface basada en el JSON de tu API
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

export function StockExitsList() {
  const [movements, setMovements] = useState<StockExitMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStockExits = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/movements/stock-exit`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            `Error ${response.status}: No se pudieron obtener los datos.`,
          );
        }

        const data: StockExitMovement[] = await response.json();
        setMovements(data);
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
    fetchStockExits();
  }, [apiUrl]);

  const handleRefresh = async () => {
    setLoading(true);
    const response = await fetch(`${apiUrl}/movements/stock-exit`, {
      credentials: "include",
    });
    const data: StockExitMovement[] = await response.json();
    setMovements(data);
    setLoading(false);
  };
  // Formato de fecha específico: "29/07/2026, 06:21 p. m."
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
      <div className="date-cell">
        <Calendar className="icon-calendar" />
        <span>
          {datePart}, {timePart}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="stock-exits-loading-panel">
        Cargando historial de movimientos...
      </div>
    );
  }

  if (error) {
    return <div className="stock-exits-error-panel">Error: {error}</div>;
  }

  return (
    <div className="stock-history-panel">
      {/* Encabezado y Descripción */}
      <div className="panel-header">
        <div className="title-group">
          <h2>Historial de Movimientos</h2>
          <p>Auditoría de entradas, salidas y cambios en el inventario.</p>
        </div>
        <button className="btn-actualizar" onClick={handleRefresh}>
          <RefreshCw /> Actualizar
        </button>
      </div>

      {/* Tabla de Movimientos */}
      {movements.length === 0 ? (
        <div className="no-data-panel">No hay registros de movimientos.</div>
      ) : (
        <div className="table-wrapper">
          <table className="history-table">
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
                  <td className="col-date">
                    {formatDateForDisplay(item.createdAt)}
                  </td>

                  {/* Tipo (Solo Salida en este caso) */}
                  <td className="col-type">
                    <span className="badge badge-type-exit">
                      <ArrowUpCircle className="icon-type" /> Salida
                    </span>
                  </td>

                  {/* Prod ID */}
                  <td className="col-prod-id">
                    <span className="badge badge-prod-id">
                      #{item.productId}
                    </span>
                  </td>

                  {/* Cantidad (Roja y negativa) */}
                  <td className="col-quantity">
                    <span className="stock-change negative">
                      -{item.quantity}
                    </span>
                  </td>

                  {/* Stock Anterior -> Nuevo */}
                  <td className="col-stock-flow">
                    <span className="stock-stock-values">
                      <span className="old-stock">{item.previousStock}</span>
                      <span className="stock-arrow">→</span>
                      <span className="new-stock">{item.newStock}</span>
                    </span>
                  </td>

                  {/* Motivo */}
                  <td className="col-reason">
                    {item.reason ? (
                      <span className="reason-text">{item.reason}</span>
                    ) : (
                      <span className="reason-empty">Sin especificar</span>
                    )}
                  </td>

                  {/* Detalles (Guión por defecto) */}
                  <td className="col-details">
                    <span className="reason-empty">-</span>
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

export default StockExitsList;
