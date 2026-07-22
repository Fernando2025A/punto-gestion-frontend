import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar/Sidebar"; 
import { LogoutModal } from "../../components/LogoutModal/LogoutModal"; 
import { useAuth } from "../../hooks/useAuth"; 
import "./DashboardLayout.css";

export function DashboardLayout() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      logout();
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Barra lateral persistente */}
      <Sidebar setIsModalOpen={setIsLogoutModalOpen} />

      {/* Contenido dinámico según la ruta activa */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Modal global de cierre de sesión */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}