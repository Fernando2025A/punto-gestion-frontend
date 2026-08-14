import React, { useEffect, useState } from "react";
import { Plus, Store, ShieldUser, LogIn, Info, Mail, Check } from "lucide-react";
import "./Business.css";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { EmployeeRole, Permission } from "../Employees/Employees";
import AddBusinessModal from "./AddBusinessModal/AddBusinessModal";

interface BusinessItem {
  businessId: number;
  businessName: string;
  businessDescription: string | null;
  isOwner: boolean;
  role: EmployeeRole;
  isActive: boolean;
  permissions: Permission[];
}

export const BusinessDashboard: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch(`${apiUrl}/business/my-access`, {
          credentials: "include",
        });

        if (!response.ok) {
          showToast(
            "No se han podido obtener los negocios disponibles",
            "error",
          );
          return;
        }

        const data: BusinessItem[] = await response.json();
        setBusinesses(data);
      } catch {
        showToast("Error al conectar con el servidor", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, [apiUrl, showToast]);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch(`${apiUrl}/business/my-access`, {
        credentials: "include",
      });

      if (!response.ok) {
        showToast("No se han podido obtener los negocios disponibles", "error");
        return;
      }

      const data: BusinessItem[] = await response.json();
      setBusinesses(data);
    } catch {
      showToast("Error al conectar con el servidor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBusiness = (businessId: number) => {
    if (user) {
      login({
        ...user,
        businessId: businessId,
        username: user.username ?? "",
        id: user.id ?? "",
        email: user.email ?? "",
      });
      showToast("Negocio seleccionado correctamente", "success");
    }
  };

  const handleAddBusiness = async (code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/invites/join`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        showToast("No se ha podido agregar negocio", "error");
        return;
      }

      showToast("Negocio agregado exitosamente", "success");
      setIsModalOpen(false);
      fetchBusinesses();
      return;
    } catch {
      showToast("Ha ocurrido un error inesperado", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="business-dashboard-main-container">
      {/* Header Sección Principal */}
      <header className="business-dashboard-header-wrapper">
        <div className="business-dashboard-header-text-container">
          <h1 className="business-dashboard-header-title">Negocios</h1>
          <p className="business-dashboard-header-description">
            Vea los negocios a los que puede acceder o acceda a uno nuevo.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="business-dashboard-primary-add-button"
        >
          <Plus size={18} />
          <span>Agregar negocio</span>
        </button>
      </header>

      {/* Grid de Tarjetas de Negocios */}
      <div className="business-dashboard-cards-grid-layout">
        {businesses.map((business) => {
          // Determinar si es el negocio actualmente activo en la sesión del usuario
          const isCurrentlyActive = user?.businessId === business.businessId;

          // Determinar la etiqueta de rol
          const roleDisplay = business.isOwner
            ? "Propietario"
            : business.role || "Sin rol";

          return (
            <div key={business.businessId} className="business-card-container">
              <div className="business-card-header-info">
                <div
                  className="business-card-icon-wrapper"
                  style={{ backgroundColor: "#2b3e80" }}
                >
                  <Store size={28} color="#ffffff" />
                </div>
                <div className="business-card-text-details">
                  <h3 className="business-card-title">
                    {business.businessName}
                  </h3>
                  <p className="business-card-description">
                    {business.businessDescription ||
                      "Sin descripción disponible."}
                  </p>
                </div>
              </div>

              {/* Badge de Estado Activo / Inactivo */}
              <div className="business-card-status-container">
                {isCurrentlyActive ? (
                  <span className="business-card-badge business-card-badge--active">
                    <span className="business-card-badge-dot business-card-badge-dot--active"></span>
                    Activo en este negocio
                  </span>
                ) : (
                  <span className="business-card-badge business-card-badge--inactive">
                    <span className="business-card-badge-dot business-card-badge-dot--inactive"></span>
                    No activo
                  </span>
                )}
              </div>

              {/* Información del Rol */}
              <div className="business-card-user-role-section">
                <div className="business-card-role-icon-container">
                  <ShieldUser size={24} />
                </div>
                <div className="business-card-role-text-container">
                  <span className="business-card-role-label">Tu rol</span>
                  <span className="business-card-role-name">{roleDisplay}</span>
                </div>
              </div>

              {/* Botón de Ingreso */}
              <button
                 disabled={business.businessId === user?.businessId ? true : false}
                className="business-card-enter-action-button"
                onClick={() => handleSelectBusiness(business.businessId)}
              >
                <LogIn size={18} style={{ display: business.businessId === user?.businessId ? "none" : "flex"}}/>
                <Check size={18} style={{ display: business.businessId === user?.businessId ? "flex" : "none"}}/>
                <span>{business.businessId === user?.businessId ? "Seleccionado" : "Seleccionar"}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Banner Informativo Inferior */}
      <footer className="business-dashboard-access-request-banner">
        <div className="business-dashboard-banner-content-left">
          <Info className="business-dashboard-banner-info-icon" size={28} />
          <div className="business-dashboard-banner-text-group">
            <h4 className="business-dashboard-banner-heading">
              ¿No ves un negocio al que perteneces?
            </h4>
            <p className="business-dashboard-banner-subtext">
              Pide al administrador que te invite o solicita acceso.
            </p>
          </div>
        </div>
        <button className="business-dashboard-secondary-request-button">
          <Mail size={16} />
          <span>Solicitar acceso</span>
        </button>
      </footer>

      <AddBusinessModal
        onSubmit={handleAddBusiness}
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        isLoading={isLoading}
      />
    </div>
  );
};
