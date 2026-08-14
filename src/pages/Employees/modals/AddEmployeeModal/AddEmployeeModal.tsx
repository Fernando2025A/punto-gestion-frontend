import React, { useState } from "react";
import { FiX, FiShield, FiClock, FiUsers, FiCheckCircle } from "react-icons/fi";
import "./AddEmployeeModal.css";

export type EmployeeRole = "ADMIN" | "CASHIER" | "STOCKER" | "EMPLOYEE";

export interface CreateInviteFormData {
  role: EmployeeRole;
  expiresInMinutes?: number;
  maxUses?: number;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateInviteFormData) => void;
  isLoading?: boolean;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [role, setRole] = useState<EmployeeRole>("EMPLOYEE");
  const [expiresInMinutes, setExpiresInMinutes] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateInviteFormData = {
      role,
      ...(expiresInMinutes ? { expiresInMinutes: Number(expiresInMinutes) } : {}),
      ...(maxUses ? { maxUses: Number(maxUses) } : {}),
    };

    onSubmit(formData);
  };

  const roleDescriptions: Record<EmployeeRole, string> = {
    ADMIN: "Acceso total a la configuración, reportes y gestión de personal.",
    CASHIER: "Acceso enfocado únicamente en la gestión de ventas y cobros.",
    STOCKER: "Acceso a productos, inventario, entradas y salidas de stock.",
    EMPLOYEE: "Acceso básico para consulta de productos y categorías.",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container dark-theme"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-wrapper">
              <FiShield className="header-icon" />
            </div>
            <div>
              <h2>Generar Invitación</h2>
              <p>Crea un código único para integrar un nuevo empleado</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FiX />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Selector de Rol */}
          <div className="form-group">
            <label className="form-label">Rol asignado</label>
            <div className="role-selector-grid">
              {(["ADMIN", "CASHIER", "STOCKER", "EMPLOYEE"] as EmployeeRole[]).map(
                (roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    className={`role-card ${role === roleOption ? "active" : ""}`}
                    onClick={() => setRole(roleOption)}
                  >
                    <div className="role-card-header">
                      <span className="role-name">{roleOption}</span>
                      {role === roleOption && (
                        <FiCheckCircle className="check-icon" />
                      )}
                    </div>
                  </button>
                )
              )}
            </div>
            <p className="role-description">{roleDescriptions[role]}</p>
          </div>

          <div className="form-row">
            {/* Tiempo de expiración */}
            <div className="form-group">
              <label className="form-label">
                <FiClock className="label-icon" /> Expiración (minutos)
              </label>
              <input
                type="number"
                min="1"
                placeholder="60 (Por defecto)"
                value={expiresInMinutes}
                onChange={(e) => setExpiresInMinutes(e.target.value)}
                className="form-input"
                disabled={isLoading}
              />
              <span className="form-hint">Opcional. Por defecto 1 hora.</span>
            </div>

            {/* Máximo de usos */}
            <div className="form-group">
              <label className="form-label">
                <FiUsers className="label-icon" /> Usos máximos
              </label>
              <input
                type="number"
                min="1"
                placeholder="1 (Por defecto)"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="form-input"
                disabled={isLoading}
              />
              <span className="form-hint">Opcional. Límite de canjes.</span>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Generando..." : "Crear Invitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};