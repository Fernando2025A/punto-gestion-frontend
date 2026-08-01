import {
  Package,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Bell,
  ChevronDown,
  ShoppingBag,
  ShoppingCart,
  DollarSign,
  PlusCircle,
} from "lucide-react";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { LogoutModal } from "../../components/LogoutModal/LogoutModal";
import {
  ProductModal,
  type ProductFormData,
} from "../../components/ProductModal/ProductModal";
import { useNavigate } from "react-router-dom";
import { StockExitModal } from "../../components/StockExitModal/StockExitModal";
import { useToast } from "../../hooks/useToast";
import { StockEntryModal } from "../../components/StockEntryModal/StockEntryModal";

interface DaySummary {
  date: string; // Formato "YYYY-MM-DD"
  totalMovements: number;
}

export function Dashboard() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [resume, setResume] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    todayMovements: [],
  });
  const [data, setData] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [stockExitModal, setIsStockExitModal] = useState(false);
  const [stockEntryModal, setIsStockEntryModal] = useState(false);
  const { showToast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getResume = async () => {
      try {
        const response = await fetch(`${apiUrl}/inventory`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setResume(data);
        }
      } catch (err) {
        console.error("Error al obtener el resumen:", err);
      }
    };

    const fetchMovements = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${apiUrl}/movements/last7days`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al obtener los datos del gráfico");
        }

        const result: DaySummary[] = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
    getResume();
  }, [apiUrl]);

  // --- Dimensiones y cálculos dinámicos para el SVG ---
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingX = 30;
  const paddingYTop = 30;
  const paddingYBottom = 30;

  // 1. Encontrar el valor máximo para escalar verticalmente el gráfico
  const maxVal = Math.max(...data.map((d) => d.totalMovements), 1);

  // 2. Mapear cada dato a coordenadas (x, y) relativas al viewBox del SVG
  const points = data.map((item, index) => {
    const stepX = (svgWidth - paddingX * 2) / Math.max(data.length - 1, 1);
    const x = paddingX + index * stepX;

    // Invertimos el eje Y porque en SVG el 0 está arriba
    const chartAreaHeight = svgHeight - paddingYTop - paddingYBottom;
    const y =
      svgHeight -
      paddingYBottom -
      (item.totalMovements / maxVal) * chartAreaHeight;

    return { x, y, ...item };
  });

  // 3. Generar cadenas de texto para SVG <path> y <polygon>
  const pathD = points.reduce((acc, point, index) => {
    return index === 0
      ? `M ${point.x},${point.y}`
      : `${acc} L ${point.x},${point.y}`;
  }, "");

  const polygonPoints = points.length
    ? `${points.map((p) => `${p.x},${p.y}`).join(" ")} ${
        points[points.length - 1].x
      },${svgHeight - 20} ${points[0].x},${svgHeight - 20}`
    : "";

  // Auxiliar para formatear la fecha YYYY-MM-DD al día de la semana (ej: "Lun", "Mar")
  const formatDayName = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    const dayName = date.toLocaleDateString("es-ES", { weekday: "short" });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1, 3);
  };

  const handleCreateProduct = async (
    data: ProductFormData,
    options: { keepOpen: boolean; keepData: boolean }
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${apiUrl}/products`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showToast("¡Producto creado con éxito!", "success");
        if (!options.keepOpen) {
          setIsProductModalOpen(false);
        }
        return true;
      } else {
        showToast("No se pudo crear el producto.", "error");
        return false;
      }
    } catch (error) {
      console.error("Error al enviar el producto:", error);
      showToast("Error al conectar con el servidor", "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      logout();
      setIsLoggingOut(false);
      setIsModalOpen(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Main Container */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-titles">
            <h1>¡Bienvenido, {user?.username}!</h1>
            <p>Aquí tienes un resumen de tu negocio.</p>
          </div>

          <div className="header-actions">
            <div className="notification-icon">
              <Bell size={20} />
              <span className="badge">5</span>
            </div>
            <div className="user-profile">
              <div className="avatar">AD</div>
              <span className="user-name">{user?.username}</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard-content">
          {/* Summary Cards Row */}
          <section className="metrics-grid">
            {/* Metric 1 */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon-bg blue">
                  <Package size={20} />
                </div>
                <span className="metric-title">Productos</span>
              </div>
              <div className="metric-body">
                <h2 className="metric-value">{resume?.totalProducts}</h2>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon-bg green">
                  <ShoppingBag size={20} />
                </div>
                <span className="metric-title">Stock total</span>
              </div>
              <div className="metric-body">
                <h2 className="metric-value">{resume?.totalStock}</h2>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon-bg purple">
                  <ShoppingCart size={20} />
                </div>
                <span className="metric-title">Movimientos hoy</span>
              </div>
              <div className="metric-body">
                <h2 className="metric-value">
                  {resume?.todayMovements ? resume.todayMovements.length : 0}
                </h2>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon-bg yellow">
                  <DollarSign size={20} />
                </div>
                <span className="metric-title">Valor de inventario</span>
              </div>
              <div className="metric-body">
                <h2 className="metric-value">
                  ${(resume?.totalValue || 0).toLocaleString()}
                </h2>
              </div>
            </div>
          </section>

          {/* Middle Grid: Stock bajo & Gráfico */}
          <section className="middle-grid">
            {/* Low Stock Panel */}
            <div className="dashboard-card low-stock-card">
              <div className="card-header-flex">
                <h3>Stock bajo</h3>
                <a href="#ver-todos" className="see-all-link">
                  Ver todos
                </a>
              </div>
            </div>

            {/* Chart Panel */}
            <div className="dashboard-card chart-card">
              <div className="card-header-flex">
                <h3>Movimientos últimos 7 días</h3>
              </div>

              {loading ? (
                <div className="chart-container" style={{ textAlign: "center", padding: "2rem" }}>
                  <span className="text-muted">Cargando gráfico...</span>
                </div>
              ) : error ? (
                <div className="chart-container" style={{ textAlign: "center", padding: "2rem" }}>
                  <span className="text-muted" style={{ color: "#ef4444" }}>
                    {error}
                  </span>
                </div>
              ) : (
                <div className="chart-container">
                  <svg className="chart-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="0" y1="40" x2={svgWidth} y2="40" stroke="#1f293d" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2={svgWidth} y2="90" stroke="#1f293d" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2={svgWidth} y2="140" stroke="#1f293d" strokeDasharray="3 3" />

                    {/* Area under curve */}
                    {polygonPoints && (
                      <polygon fill="url(#chartGradient)" points={polygonPoints} />
                    )}

                    {/* Main Line */}
                    {pathD && (
                      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" />
                    )}

                    {/* Data Dots */}
                    {points.map((point) => {
                      const isHighest = point.totalMovements === maxVal && maxVal > 0;
                      return (
                        <g key={point.date}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={isHighest ? 5 : 4}
                            fill={isHighest ? "#60a5fa" : "#3b82f6"}
                            stroke={isHighest ? "#ffffff" : "none"}
                            strokeWidth={isHighest ? 2 : 0}
                          >
                            <title>{`${point.date}: ${point.totalMovements} movimientos`}</title>
                          </circle>
                        </g>
                      );
                    })}
                  </svg>

                  {/* X Axis Labels */}
                  <div className="chart-labels">
                    {data.map((item) => (
                      <span key={item.date} title={item.date}>
                        {formatDayName(item.date)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h3>Acciones rápidas</h3>
            <div className="actions-grid">
              <button
                className="action-card"
                onClick={() => setIsProductModalOpen(true)}
              >
                <div className="action-icon-wrapper blue">
                  <PlusCircle size={22} />
                </div>
                <div className="action-text">
                  <span className="action-title">Nuevo producto</span>
                  <span className="action-desc">
                    Agregar producto al inventario
                  </span>
                </div>
              </button>

              <button className="action-card" onClick={() => setIsStockEntryModal(true)}>
                <div className="action-icon-wrapper green">
                  <ArrowDownRight size={22} />
                </div>
                <div className="action-text">
                  <span className="action-title">Registrar entrada</span>
                  <span className="action-desc">
                    Agregar stock al inventario
                  </span>
                </div>
              </button>

              <button
                onClick={() => setIsStockExitModal(true)}
                className="action-card"
              >
                <div className="action-icon-wrapper purple">
                  <ArrowUpRight size={22} />
                </div>
                <div className="action-text">
                  <span className="action-title">Registrar salida</span>
                  <span className="action-desc">
                    Descontar stock del inventario
                  </span>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon-wrapper yellow">
                  <TrendingUp size={22} />
                </div>
                <div className="action-text">
                  <span className="action-title">Ver reportes</span>
                  <span className="action-desc">
                    Consultar reportes y estadísticas
                  </span>
                </div>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Modales */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateProduct}
        isLoading={isSaving}
      />
      <LogoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
      <StockExitModal
        isOpen={stockExitModal}
        onClose={() => setIsStockExitModal(false)}
      />
      <StockEntryModal 
        isOpen={stockEntryModal}
        onClose={() => setIsStockEntryModal(false)}
      />
    </div>
  );
}