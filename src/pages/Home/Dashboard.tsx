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
  })

  const [stockExitModal, setIsStockExitModal] = useState(false);
  const { showToast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getResume = async () => {
      const response = await fetch(`${apiUrl}/inventory`, {
        credentials: "include",
      });
      const data = await response.json();
      setResume(data);
    }
    getResume();
  }, [apiUrl])

  const handleCreateProduct = async (
    data: ProductFormData,
    options: { keepOpen: boolean; keepData: boolean },
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
        setIsModalOpen(false);
      }

      // Retornamos true para indicar éxito
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
      // 2. Limpiar estado local, cerrar modal y redirigir
      logout();
      setIsLoggingOut(false);
      setIsModalOpen(false);
      navigate("/", { replace: true });
    }
  };

  // Datos mock para "Stock bajo"
  const lowStockItems = [];

  return (
    <div className="dashboard-layout">
      {isModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProduct}
          isLoading={isSaving}
        />
      )}
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
                <h2 className="metric-value">{resume?.todayMovements.length + 1}</h2>
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
                <h2 className="metric-value">${resume?.totalValue.toLocaleString()}</h2>
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
              {/* <ul className="low-stock-list">
                {lowStockItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id} className="low-stock-item">
                      <div className="item-info">
                        <div className="item-icon-box">
                          <Icon size={18} />
                        </div>
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-category">{item.category}</span>
                        </div>
                      </div>
                      <span className="stock-alert">{item.stock}</span>
                    </li>
                  );
                })}
              </ul> */}
            </div>

            {/* Chart Panel */}
            <div className="dashboard-card chart-card">
              <div className="card-header-flex">
                <h3>Movimientos últimos 7 días</h3>
              </div>
              <div className="chart-container">
                {/* SVG Mockup para el gráfico de línea */}
                <svg className="chart-svg" viewBox="0 0 500 200">
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop
                        offset="100%"
                        stopColor="#3b82f6"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line
                    x1="0"
                    y1="40"
                    x2="500"
                    y2="40"
                    stroke="#1f293d"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="90"
                    x2="500"
                    y2="90"
                    stroke="#1f293d"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="140"
                    x2="500"
                    y2="140"
                    stroke="#1f293d"
                    strokeDasharray="3 3"
                  />

                  {/* Line area */}
                  <polygon
                    fill="url(#chartGradient)"
                    points="30,150 100,100 170,120 240,40 310,110 380,70 450,110 450,180 30,180"
                  />
                  {/* Line */}
                  <path
                    d="M 30,150 L 100,100 L 170,120 L 240,40 L 310,110 L 380,70 L 450,110"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />
                  {/* Dots */}
                  <circle cx="30" cy="150" r="4" fill="#3b82f6" />
                  <circle cx="100" cy="100" r="4" fill="#3b82f6" />
                  <circle cx="170" cy="120" r="4" fill="#3b82f6" />
                  <circle
                    cx="240"
                    cy="40"
                    r="5"
                    fill="#60a5fa"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <circle cx="310" cy="110" r="4" fill="#3b82f6" />
                  <circle cx="380" cy="70" r="4" fill="#3b82f6" />
                  <circle cx="450" cy="110" r="4" fill="#3b82f6" />
                </svg>

                {/* X Axis Labels */}
                <div className="chart-labels">
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                </div>
              </div>
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

              <button className="action-card">
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

              <button onClick={() => setIsStockExitModal(true)} className="action-card">
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
    </div>
  );
}
