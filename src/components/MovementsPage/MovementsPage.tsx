import { useEffect, useState } from "react";
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
} from "lucide-react";
import "./MovementsPage.css";

// --- Tipos de datos según tu Backend ---
export type MovementType =
  | "STOCK_ENTRY"
  | "STOCK_EXIT"
  | "CREATE_PRODUCT"
  | "UPDATE_PRODUCT"
  | "DELETE_PRODUCT";

export interface Movement {
  id: number;
  type: MovementType;
  quantity: number | null;
  previousStock: number;
  newStock: number;
  reason: string | null;
  details: Record<string, any> | null;
  createdAt: string;
  inventoryId: number;
  productId: number | null;
  userId: string;
}



export function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Filtros locales
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  

  useEffect(() => {
    const fetchMovements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/movements`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al cargar los movimientos");
      const data = await response.json();
      setMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };
    fetchMovements();
  }, [apiUrl]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/movements`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al cargar los movimientos");
      const data = await response.json();
      setMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };
  // Helper para renderizar Badge y Formato de tipo
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

  // Helper para formatear las fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Helper para renderizar los detalles JSON de forma legible
  const renderDetails = (movement: Movement) => {
    if (!movement.details) return <span className="text-muted">-</span>;

    // Si fue una actualización con origen y destino
    if (movement.type === "UPDATE_PRODUCT") {
      return (
        <div className="movement-details-box">
          {Object.entries(movement.details).map(([key, value]: [string, any]) => (
            <div key={key} className="detail-item">
              <strong>{key}:</strong>{" "}
              {value.from !== null && value.from !== undefined ? (
                <span className="detail-from">{value.from}</span>
              ) : null}
              {value.from !== null && value.from !== undefined ? " ➔ " : ""}
              <span className="detail-to">{value.to}</span>
            </div>
          ))}
        </div>
      );
    }

    // Si fue una eliminación
    if (movement.type === "DELETE_PRODUCT") {
      const { deletedProductName, deletedProductPrice } = movement.details;
      return (
        <div className="movement-details-box">
          {deletedProductName && <div><strong>Nombre:</strong> {deletedProductName}</div>}
          {deletedProductPrice && <div><strong>Precio:</strong> ${deletedProductPrice}</div>}
        </div>
      );
    }

    return <span className="text-muted">{JSON.stringify(movement.details)}</span>;
  };

  // Filtrado en cliente
  const filteredMovements = movements.filter((item) => {
    const matchesType = selectedType === "ALL" || item.type === selectedType;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      item.id.toString().includes(search) ||
      (item.reason && item.reason.toLowerCase().includes(search)) ||
      (item.productId && item.productId.toString().includes(search)) ||
      (item.details && JSON.stringify(item.details).toLowerCase().includes(search));

    return matchesType && matchesSearch;
  });

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
          onClick={handleRefresh}
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
            onChange={(e) => setSelectedType(e.target.value)}
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
          <button className="btn-retry">
            Reintentar
          </button>
        </div>
      ) : filteredMovements.length === 0 ? (
        <div className="movements-state-card">
          <Info size={32} className="icon-state" />
          <p>No se encontraron movimientos registrados con los filtros aplicados.</p>
        </div>
      ) : (
        /* Tabla de Movimientos */
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
            {item.type === "STOCK_EXIT" ? `-${item.quantity}` : item.quantity}
          </span>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>
      <td className="cell-stock" data-label="Stock Anterior / Nuevo">
        <Layers size={14} className="text-muted" />
        <span>{item.previousStock}</span>
        <span className="stock-arrow">➔</span>
        <strong>{item.newStock}</strong>
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
      )}
    </div>
  );
}