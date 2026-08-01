import { useState } from "react";
import {
  BarChart2,
  Home,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Tags,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

type Props = {
  setIsModalOpen: (state: boolean) => void;
};

export function Sidebar({ setIsModalOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className={`sidebar ${isOpen ? "is-open" : ""}`}>
      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <div className="logo-wrapper-sidebar">
          <BarChart2 className="logo-icon" size={24} />
          <span className="logo-text">Punto Gestión</span>
        </div>

        {/* Botón Hamburguesa (solo visible en pantallas pequeñas) */}
        <button
          className="menu-toggle-btn"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú Desplegable / Navegación */}
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <NavLink to="/home" className={getNavClass} onClick={closeMenu}>
            <Home size={18} />
            <span>Inicio</span>
          </NavLink>

          <NavLink to="/products" className={getNavClass} onClick={closeMenu}>
            <Package size={18} />
            <span>Productos</span>
          </NavLink>

          <NavLink to="/entries" className={getNavClass} onClick={closeMenu}>
            <ArrowDownRight size={18} />
            <span>Entradas</span>
          </NavLink>

          <NavLink to="/shipments" className={getNavClass} onClick={closeMenu}>
            <ArrowUpRight size={18} />
            <span>Salidas</span>
          </NavLink>

          <NavLink to="/movements" className={getNavClass} onClick={closeMenu}>
            <ArrowLeftRight size={18} />
            <span>Movimientos</span>
          </NavLink>

          <NavLink to="/categories" className={getNavClass} onClick={closeMenu}>
            <Tags size={18} />
            <span>Categorías</span>
          </NavLink>

          <NavLink to="/suppliers" className={getNavClass} onClick={closeMenu}>
            <Users size={18} />
            <span>Proveedores</span>
          </NavLink>

          <NavLink to="/reports" className={getNavClass} onClick={closeMenu}>
            <TrendingUp size={18} />
            <span>Reportes</span>
          </NavLink>

          <NavLink to="/settings" className={getNavClass} onClick={closeMenu}>
            <Settings size={18} />
            <span>Configuración</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item logout-btn"
            onClick={() => {
              closeMenu();
              setIsModalOpen(true);
            }}
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}