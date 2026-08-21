import React, { useEffect, useState } from "react";
import { User, Store, ShieldCheck, Lock, Save, Crown } from "lucide-react";
import { BusinessSettings } from "./BusinessSettingsSection/BusinessSettings"; // <-- Importamos el componente
import "./Settings.css";
import { useToast } from "../../hooks/useToast";
import { PasswordChangeConfirmationModal } from "./PasswordConfirmModal/PasswordChangeConfirmationModal";
import { PasswordResetExecutionModal } from "./PasswordResetExecutionModal/PasswordResetExecutionModal";
import { PricingPlansSection } from "./PricingPlansSection/PricingPlansSection";

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "business" | "subscriptions"
  >("profile");

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const { showToast } = useToast();
  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    imageUrl: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        showToast("Error al obtener los datos", "error");
        return;
      }

      const data = await response.json();
      setFormData({
        fullName: data.username,
        email: data.email,
        phone: data.phoneNumber ?? "",
        imageUrl: data.imageUrl,
      });
    };
    fetchData();
  }, [apiUrl, showToast]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // 1. Creamos un objeto FormData para empaquetar texto y archivos
    const formDataPayload = new FormData();
    formDataPayload.append("username", formData.fullName);
    formDataPayload.append("phoneNumber", formData.phone);

    // Si el usuario seleccionó una nueva imagen, la adjuntamos (asumiendo que guardas el archivo en un estado como 'selectedAvatarFile')
    if (selectedAvatarFile) {
      formDataPayload.append("avatar", selectedAvatarFile);
    }

    const response = await fetch(`${apiUrl}/auth`, {
      method: "PATCH",
      credentials: "include",
      body: formDataPayload,
    });

    if (response.ok) {
      showToast("Datos actualizados correctamente", "success");
      return;
    }

    showToast("No se han podido actualizar los datos", "error");
  } catch {
    showToast("Ocurrió un error al conectar con el servidor", "error");
  } finally {
    setIsLoading(false);
  }
};

const handleAvatarChange = (file: File) => {
  setSelectedAvatarFile(file); // Guardas el archivo físico para enviarlo en el submit
  setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) })); // <-- Cambiado de avatarUrl a imageUrl para que coincida
};

  const handleConfirmChange = async () => {
    const response = await fetch(`${apiUrl}/auth/forgot-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
      }),
    });
    if (response.ok) {
      setIsResetModalOpen(true);
      return;
    }
    throw new Error("No se ha podido enviar el código");
  };

  const handleResetExecute = async (
    verificationCode: string,
    newPassword: string,
  ) => {
    const response = await fetch(`${apiUrl}/auth/reset-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        code: verificationCode,
        newPassword,
      }),
    });
    if (response.ok) {
      showToast("Contraseña reestablecida con éxito", "success");
      return;
    }
    throw new Error("No se ha podido reestablecer contraseña");
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Configuración del Sistema</h1>

      {/* Tabs Header */}
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={18} />
          <span>Mi Perfil</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "business" ? "active" : ""}`}
          onClick={() => setActiveTab("business")}
        >
          <Store size={18} />
          <span>Negocio</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "subscriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("subscriptions")}
        >
          <Crown size={18} />
          <span>Suscripciones</span>
        </button>
      </div>

      {/* Tab Content: Mi Perfil */}
      {activeTab === "profile" && (
        <form onSubmit={handleSubmit} className="settings-grid">
          {/* Left Column: Personal Information */}
          <div className="settings-card">
            <div className="card-header">
              <div className="icon-badge">
                <User size={20} />
              </div>
              <h2>Información Personal</h2>
            </div>

            {/* --- Sección de Avatar y Cambio de Imagen --- */}
            <div
              className="profile-avatar-section"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                marginBottom: "1.5rem",
                paddingBottom: "1.25rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div
                className="profile-avatar-container"
                style={{
                  position: "relative",
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#2a2a2a",
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Avatar de perfil"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                    }}
                  >
                    <User size={32} />
                  </div>
                )}
              </div>

              <div
                className="profile-avatar-actions"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label
                  htmlFor="avatar-upload-input"
                  className="btn-outline"
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>Cambiar Avatar</span>
                </label>
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && typeof handleAvatarChange === 'function') {
                      handleAvatarChange(file);
                    }
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  PNG, JPG de hasta 2MB
                </span>
              </div>
            </div>
            {/* --------------------------------------------- */}

            <div className="form-group">
              <label htmlFor="fullName">Nombre Completo</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                disabled={true}
                type="email"
                id="email"
                name="email"
                value={formData.email}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono de Contacto</label>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Establece un número de teléfono"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <button disabled={isLoading} type="submit" className="btn-primary">
              <Save size={18} />
              <span>{isLoading ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>

          {/* Right Column: Account Security */}
          <div className="settings-card">
            <div className="card-header">
              <div className="icon-badge">
                <ShieldCheck size={20} />
              </div>
              <h2>Seguridad de la Cuenta</h2>
            </div>

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              type="button"
              className="btn-outline"
            >
              <Lock size={18} />
              <span>Cambiar Contraseña</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab Content: Mi Negocio */}
      {activeTab === "business" && <BusinessSettings />}

      {/* Tab Content: Notificaciones y otras secciones */}
      {activeTab === "subscriptions" && (
        <PricingPlansSection />
      )}

      <PasswordChangeConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmChange}
        userEmail={formData.email}
      />
      <PasswordResetExecutionModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        userEmail={formData.email}
        onSubmit={handleResetExecute}
      />
    </div>
  );
};
