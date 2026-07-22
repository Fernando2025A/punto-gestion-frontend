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
} from "lucide-react";
import { NavLink } from 'react-router-dom'
import "./Sidebar.css";

type Props = {
  setIsModalOpen: (state: boolean) => void
}

export function Sidebar({ setIsModalOpen}: Props) {
const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-item active" : "nav-item";
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <BarChart2 className="logo-icon" size={24} />
        <span className="logo-text">Punto Gestión</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/home" className={getNavClass}>
          <Home size={18} />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/products" className={getNavClass}>
          <Package size={18} />
          <span>Productos</span>
        </NavLink>

        <NavLink to="/entries" className={getNavClass}>
          <ArrowDownRight size={18} />
          <span>Entradas</span>
        </NavLink>

        <NavLink to="/shipments" className={getNavClass}>
          <ArrowUpRight size={18} />
          <span>Salidas</span>
        </NavLink>

        <NavLink to="/movements" className={getNavClass}>
          <ArrowLeftRight size={18} />
          <span>Movimientos</span>
        </NavLink>

        <NavLink to="/categories" className={getNavClass}>
          <Tags size={18} />
          <span>Categorías</span>
        </NavLink>

        <NavLink to="/suppliers" className={getNavClass}>
          <Users size={18} />
          <span>Proveedores</span>
        </NavLink>

        <NavLink to="/reports" className={getNavClass}>
          <TrendingUp size={18} />
          <span>Reportes</span>
        </NavLink>

        <NavLink to="/settings" className={getNavClass}>
          <Settings size={18} />
          <span>Configuración</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          className="nav-item logout-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

