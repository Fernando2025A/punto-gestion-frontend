import React, { useEffect, useState } from "react";
import { Plus, Store, ShieldUser, LogIn, Info, Mail, Check } from "lucide-react";
import "./Business.css";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { EmployeeRole, Permission } from "../Employees/Employees";
import AddBusinessModal from "./AddBusinessModal/AddBusinessModal";

export interface BusinessItem {
  businessId: number;
  businessName: string;
  businessDescription: string | null;
  imageUrl?: string;
  businessLogoUrl?: string; // Por si el backend usa esta clave en lugar de imageUrl
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

  const handleSelectBusiness = async (businessId: number) => {
    const updatedUser = await fetch(`${apiUrl}/auth`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activeBusinessId: businessId,
      })
    })
    const data = await updatedUser.json();
    if (user) {
      login({
        ...user,
        businessId: data.activeBusinessId,
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

          // Obtener la URL del logo de cualquiera de las dos propiedades posibles
          const logoUrl = business.imageUrl || business.businessLogoUrl;

          // Determinar la etiqueta de rol
          const roleDisplay = business.isOwner
            ? "Propietario"
            : business.role || "Sin rol";

          return (
            <div key={business.businessId} className="business-card-container">
              <div className="business-card-header-info">
                {/* 👈 Renderiza la imagen si existe, o el ícono <Store /> de respaldo */}
                <div
                  className="business-card-icon-wrapper"
                  style={{
                    backgroundColor: logoUrl ? "transparent" : "#2b3e80",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`Logo de ${business.businessName}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        // En caso de error de carga en el cliente, muestra el ícono por defecto
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Store size={28} color="#ffffff" />
                  )}
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
                disabled={business.businessId === user?.businessId}
                className="business-card-enter-action-button"
                onClick={() => handleSelectBusiness(business.businessId)}
              >
                <LogIn
                  size={18}
                  style={{
                    display:
                      business.businessId === user?.businessId
                        ? "none"
                        : "flex",
                  }}
                />
                <Check
                  size={18}
                  style={{
                    display:
                      business.businessId === user?.businessId
                        ? "flex"
                        : "none",
                  }}
                />
                <span>
                  {business.businessId === user?.businessId
                    ? "Seleccionado"
                    : "Seleccionar"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <AddBusinessModal
        onSubmit={handleAddBusiness}
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        isLoading={isLoading}
      />
    </div>
  );
};