import React, { useState, useEffect } from "react";
import {
  FiX,
  FiUserCheck,
  FiShield,
  FiSave,
  FiCalendar,
  FiMail,
  FiUser,
  FiLock,
} from "react-icons/fi";
import "./EditEmployeeModal.css";
import type { EmployeeData, Permission, EmployeeRole } from "../../Employees";

// Grupos de permisos con etiquetas legibles
const PERMISSION_GROUPS: Record<
  string,
  { label: string; permissions: { key: Permission; label: string }[] }
> = {
  PRODUCTOS: {
    label: "Productos",
    permissions: [
      { key: "VIEW_PRODUCT", label: "Ver productos" },
      { key: "CREATE_PRODUCT", label: "Crear productos" },
      { key: "UPDATE_PRODUCT", label: "Editar productos" },
      { key: "DELETE_PRODUCT", label: "Eliminar productos" },
    ],
  },
  STOCK: {
    label: "Control de Stock",
    permissions: [
      { key: "REGISTER_STOCK_ENTRY", label: "Registrar entradas" },
      { key: "REGISTER_STOCK_EXIT", label: "Registrar salidas" },
      { key: "VIEW_MOVEMENTS", label: "Ver movimientos" },
    ],
  },
  CATEGORIAS: {
    label: "Categorías",
    permissions: [
      { key: "VIEW_CATEGORIES", label: "Ver categorías" },
    ],
  },
  PROVEEDORES: {
    label: "Proveedores",
    permissions: [
      { key: "VIEW_SUPPLIERS", label: "Ver proveedores" },
      { key: "CREATE_SUPPLIERS", label: "Crear proveedores" },
      { key: "UPDATE_SUPPLIERS", label: "Editar proveedores" },
      { key: "DELETE_SUPPLIERS", label: "Eliminar proveedores" },
    ],
  },
  REPORTES: {
    label: "Reportes y Métricas",
    permissions: [
      { key: "VIEW_REPORTS", label: "Ver reportes" },
      { key: "EXPORT_REPORTS_PDF", label: "Exportar en PDF" },
      { key: "EXPORT_REPORTS_EXCEL", label: "Exportar en Excel" },
    ],
  },
  DASHBOARD: {
    label: "Panel Principal",
    permissions: [
      { key: "VIEW_DASHBOARD", label: "Ver Dashboard" },
      { key: "VIEW_FINANCIAL_SUMMARY", label: "Ver resumen financiero" },
    ],
  },
  EMPLEADOS: {
    label: "Gestión de Empleados",
    permissions: [
      { key: "VIEW_EMPLOYEES", label: "Ver empleados" },
      { key: "UPDATE_EMPLOYEES", label: "Editar empleados" },
      { key: "DELETE_EMPLOYEES", label: "Eliminar empleados" },
    ],
  },
  INVITACIONES: {
    label: "Invitaciones",
    permissions: [
      { key: "VIEW_INVITATIONS", label: "Ver invitaciones" },
      { key: "CREATE_INVITATIONS", label: "Crear invitaciones" },
      { key: "DELETE_INVITATIONS", label: "Revocar invitaciones" },
    ],
  },
  CONFIGURACION: {
    label: "Configuración & Negocio",
    permissions: [
      { key: "VIEW_SETTINGS", label: "Ver configuración" },
      { key: "UPDATE_SETTINGS", label: "Actualizar configuración" },
      { key: "UPDATE_BUSINESS", label: "Editar negocio" },
      { key: "MANAGE_SUBSCRIPTION", label: "Gestionar suscripción" },
    ],
  },
};

export interface EditEmployeeUpdateData {
  employeeId: number;
  role: EmployeeRole;
  isActive: boolean;
  permissions: Permission[];
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeData | null;
  onSave: (data: EditEmployeeUpdateData) => Promise<void> | void;
  isLoading?: boolean;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
  isLoading = false,
}) => {
  const [role, setRole] = useState<EmployeeRole>("EMPLOYEE");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  // Se actualiza el estado local cada vez que cambia el empleado prop
  useEffect(() => {
    if (employee) {
      setRole(employee.role);
      setIsActive(employee.isActive);
      setSelectedPermissions(employee.permissions || []);
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const isOwner = employee.role === "OWNER";

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleTogglePermission = (permission: Permission) => {
    if (isOwner) return;
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSelectAllGroup = (permissions: Permission[], enable: boolean) => {
    if (isOwner) return;
    if (enable) {
      const merged = Array.from(new Set([...selectedPermissions, ...permissions]));
      setSelectedPermissions(merged);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => !permissions.includes(p)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      employeeId: employee.id,
      role,
      isActive,
      permissions: selectedPermissions,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container dark-theme edit-employee-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-wrapper blue">
              <FiUserCheck className="header-icon" />
            </div>
            <div>
              <h2>Editar Empleado</h2>
              <p>Modifica el rol, estado y permisos individuales</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} type="button">
            <FiX />
          </button>
        </div>

        {/* Formulario / Cuerpo */}
        <form id="edit-employee-form" onSubmit={handleSubmit} className="modal-body">
          {/* Banner de Información del Empleado */}
          <div className="user-info-banner">
            <div className="user-details">
              <div className="detail-row">
                <FiUser className="info-icon" />
                <span className="username">{employee.user.username}</span>
                {isOwner && <span className="owner-badge">Propietario</span>}
              </div>
              <div className="detail-row text-sub">
                <FiMail className="info-icon" />
                <span>{employee.user.email}</span>
              </div>
              <div className="detail-row text-sub">
                <FiCalendar className="info-icon" />
                <span>Registrado el {formatDate(employee.createdAt)}</span>
              </div>
            </div>

            {/* Controles de Rol y Estado */}
            <div className="user-controls">
              <div className="control-group">
                <label>Rol asignado</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as EmployeeRole)}
                  disabled={isOwner || isLoading}
                >
                  <option value="ADMIN">ADMINISTRADOR</option>
                  <option value="CASHIER">CAJERO</option>
                  <option value="STOCKER">ALMACENERO</option>
                  <option value="EMPLOYEE">EMPLEADO GENERAL</option>
                  {isOwner && <option value="OWNER">PROPIETARIO</option>}
                </select>
              </div>

              <div className="control-group">
                <label>Estado de cuenta</label>
                <button
                  type="button"
                  className={`status-toggle-btn ${isActive ? "active" : "inactive"}`}
                  disabled={isOwner || isLoading}
                  onClick={() => setIsActive(!isActive)}
                >
                  <span className="dot" />
                  {isActive ? "Cuenta Activa" : "Cuenta Inactiva"}
                </button>
              </div>
            </div>
          </div>

          {/* Permisos */}
          <div className="permissions-section">
            <div className="section-header">
              <h3>
                <FiShield /> Permisos del Sistema
              </h3>
              {isOwner ? (
                <span className="owner-notice">
                  <FiLock /> El propietario posee todos los accesos por defecto.
                </span>
              ) : (
                <span className="perm-counter">
                  {selectedPermissions.length} permisos asignados
                </span>
              )}
            </div>

            <div className="permissions-grid">
              {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                const groupKeys = group.permissions.map((p) => p.key);
                const allSelected = groupKeys.every((k) =>
                  selectedPermissions.includes(k)
                );

                return (
                  <div key={groupKey} className="permission-card">
                    <div className="permission-card-header">
                      <h4>{group.label}</h4>
                      {!isOwner && (
                        <button
                          type="button"
                          className="btn-text-action"
                          onClick={() => handleSelectAllGroup(groupKeys, !allSelected)}
                        >
                          {allSelected ? "Desmarcar todo" : "Marcar todo"}
                        </button>
                      )}
                    </div>

                    <div className="permission-list">
                      {group.permissions.map(({ key, label }) => {
                        const isChecked = isOwner || selectedPermissions.includes(key);

                        return (
                          <label key={key} className="switch-item">
                            <span className="switch-label">{label}</span>
                            <div className="switch">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isOwner || isLoading}
                                onChange={() => handleTogglePermission(key)}
                              />
                              <span className="slider round"></span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
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
            form="edit-employee-form"
            className="btn-primary"
            disabled={isLoading || isOwner}
          >
            <FiSave /> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};