import { useState, useEffect } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./Employees.css";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
  AddEmployeeModal,
  type CreateInviteFormData,
} from "./modals/AddEmployeeModal/AddEmployeeModal";
import { Check } from "lucide-react";
import {
  type ActiveInvite,
  ActiveInvitesModal,
} from "./modals/ActiveInvitesModal/ActiveInvitesModal";
import {
  EditEmployeeModal,
  type EditEmployeeUpdateData,
} from "./modals/EditEmployeeModal/EditEmployeeModal";

export type EmployeeRole =
  | "OWNER"
  | "ADMIN"
  | "CASHIER" // Cajero (solo ventas)
  | "STOCKER" // Encargado de inventario
  | "EMPLOYEE"; // General

export type Permission =
  | "VIEW_PRODUCT"
  | "CREATE_PRODUCT"
  | "UPDATE_PRODUCT"
  | "DELETE_PRODUCT"
  | "REGISTER_STOCK_ENTRY"
  | "REGISTER_STOCK_EXIT"
  | "ADJUST_STOCK"
  | "VIEW_MOVEMENTS"
  | "VIEW_CATEGORIES"
  | "CREATE_CATEGORIES"
  | "UPDATE_CATEGORIES"
  | "DELETE_CATEGORIES"
  | "VIEW_SUPPLIERS"
  | "CREATE_SUPPLIERS"
  | "UPDATE_SUPPLIERS"
  | "DELETE_SUPPLIERS"
  | "VIEW_REPORTS"
  | "EXPORT_REPORTS_PDF"
  | "EXPORT_REPORTS_EXCEL"
  | "VIEW_DASHBOARD"
  | "VIEW_FINANCIAL_SUMMARY"
  | "VIEW_EMPLOYEES"
  | "CREATE_EMPLOYEES"
  | "UPDATE_EMPLOYEES"
  | "DELETE_EMPLOYEES"
  | "MANAGE_EMPLOYEE_PERMISSIONS"
  | "MANAGE_EMPLOYEE_ROLES"
  | "CREATE_INVITATIONS"
  | "DELETE_INVITATIONS"
  | "VIEW_INVITATIONS"
  | "VIEW_SETTINGS"
  | "UPDATE_SETTINGS"
  | "UPDATE_BUSINESS"
  | "DELETE_BUSINESS"
  | "UPDATE_PROFILE"
  | "CHANGE_PASSWORD"
  | "MANAGE_SUBSCRIPTION";

interface User {
  id: string;
  username: string;
  email: string;
}

export interface EmployeeData {
  id: number;
  role: EmployeeRole;
  permissions: Permission[];
  isActive: boolean;
  userId: string;
  businessId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface EmployeeResponse {
  data: EmployeeData[];
}

export function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState<EmployeeData[]>([
    {
      id: 1,
      role: "OWNER",
      permissions: [],
      isActive: true,
      userId: "",
      businessId: 1,
      createdAt: "",
      updatedAt: "",
      user: {
        id: "",
        username: "",
        email: "",
      },
    },
  ]);
  const [employeesCount, setEmployeesCount] = useState(1);
  const [createModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false);
  const [invites, setInvites] = useState<ActiveInvite[]>([]);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeData>({
    id: 1,
    role: "OWNER",
    permissions: [],
    isActive: true,
    userId: "",
    businessId: 1,
    createdAt: "",
    updatedAt: "",
    user: {
      id: "",
      username: "",
      email: "",
    },
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${apiUrl}/employees/${user?.businessId}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        showToast("No se pudo obtener los empleados", "error");
        return;
      }
      const data: EmployeeResponse = await response.json();
      setEmployees(data.data);
      setEmployeesCount(data.data.length - 1);
    };
    const fetchInvites = async () => {
      const response = await fetch(
        `${apiUrl}/invites?businessId=${user?.businessId}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        showToast("No se han podido obtener las invitaciones", "error");
        return;
      }
      const data: ActiveInvite[] = await response.json();
      setInvites(data);
    };
    fetchData();
    fetchInvites();
  }, [apiUrl, user?.businessId, showToast]);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);

    return date
      .toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Formato AM/PM
      })
      .replace(",", ""); // Quita la coma opcional entre fecha y hora
  };

  const refreshInvites = async () => {
    const response = await fetch(
      `${apiUrl}/invites?businessId=${user?.businessId}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      showToast("No se han podido obtener las invitaciones", "error");
      return;
    }
    const data: ActiveInvite[] = await response.json();
    setInvites(data);
  };

  const handleCreateInvite = async (data: CreateInviteFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/invites?businessId=${user?.businessId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: data.role,
            expiresInMinutes: data.expiresInMinutes,
            maxUses: data.maxUses,
          }),
        },
      );

      if (!res.ok) {
        showToast("No se ha podido crear la invitación", "error");
        return;
      }
      showToast("Código generado exitosamente", "success");
      setIsCreateModalOpen(false);
      return;
    } catch {
      showToast("Ha ocurrido un error al solicitar código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvite = async (inviteId: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/invites/${inviteId}?businessId=${user?.businessId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        showToast("No se ha podido eliminar la invitación", "error");
        return;
      }
      showToast("Código eliminado exitosamente", "success");
      refreshInvites();
      return;
    } catch {
      showToast("Ha ocurrido un error al eliminar código", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployeePermission = async (
    data: EditEmployeeUpdateData,
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/employees/${data.employeeId}?businessId=${user?.businessId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            permissions: data.permissions,
            role: data.role,
            isActive: data.isActive,
          }),
        },
      );

      if (!res.ok) {
        showToast("No se ha podido actualizar empleado", "error");
        return;
      }
      showToast("Empleado actualizado exitosamente", "success");
      setIsEditEmployeeModalOpen(false);
      return;
    } catch {
      showToast("Ha ocurrido un error inesperado", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="employees-page-container">
      {/* Encabezado Principal */}
      <div className="employees-header-row">
        <div>
          <h1 className="employees-title">Empleados</h1>
          <p className="employees-subtitle">
            Gestiona los empleados y sus permisos dentro del negocio.
          </p>
        </div>

        {/* Agrupamos los botones de acción */}
        <div className="header-actions">
          <button
            onClick={() => {
              setIsInvitesModalOpen(true);
              refreshInvites();
            }}
            type="button"
            className="btn-view-codes"
          >
            <Check className="btn-icon" /> Códigos activos
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
            className="btn-add-employee"
          >
            <FiPlus className="btn-icon" /> Nuevo empleado
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper kpi-icon-blue">
              <FiUsers />
            </div>
            <span className="kpi-label">Total empleados</span>
          </div>
          <div className="kpi-value">{employeesCount}</div>
          <div className="kpi-subtext">Empleados registrados</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper kpi-icon-green">
              <FiUserCheck />
            </div>
            <span className="kpi-label">Activos</span>
          </div>
          <div className="kpi-value">
            {employees.filter((emp) => emp.isActive).length - 1}
          </div>
          <div className="kpi-subtext">Empleados activos</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper kpi-icon-orange">
              <FiUserX />
            </div>
            <span className="kpi-label">Inactivos</span>
          </div>
          <div className="kpi-value">
            {employees.filter((emp) => !emp.isActive).length}
          </div>
          <div className="kpi-subtext">Empleados inactivos</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper kpi-icon-purple">
              <FiShield />
            </div>
            <span className="kpi-label">Roles</span>
          </div>
          <div className="kpi-value">
            {new Set(employees.map((emp) => emp.role)).size}
          </div>
          <div className="kpi-subtext">Roles definidos</div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="employees-filters-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Buscar empleado por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-right-group">
          <select
            className="filter-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="ALL">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Vendedor">Vendedor</option>
            <option value="Almacenero">Almacenero</option>
            <option value="Contador">Contador</option>
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>

          <button type="button" className="btn-filter-trigger">
            <FiFilter /> Filtros
          </button>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="table-responsive-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Rol</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th className="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>
                  <div className="employee-info-cell">
                    <div className="employee-name-group">
                      <div className="employee-name-row">
                        <span className="employee-name">
                          {emp.user.username}
                        </span>
                        {emp.role === "OWNER" && (
                          <span className="current-user-badge">Tú</span>
                        )}
                      </div>
                      <span className="employee-start-date">
                        Desde el {formatDate(emp.createdAt)}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge`}>{emp.role}</span>
                </td>
                <td className="text-secondary">{emp.user.email}</td>
                <td className="text-secondary">{23232}</td>
                <td>
                  <span
                    className={`status-pill ${
                      emp.isActive ? "status-active" : "status-inactive"
                    }`}
                  >
                    <span className="status-dot"></span>
                    {emp.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <div className="actions-cell-group">
                    <button
                      type="button"
                      className="action-icon-btn"
                      title="Ver detalle"
                    >
                      <FiEye />
                    </button>
                    <button
                      style={{
                        display: emp.role === "OWNER" ? "none" : "flex",
                      }}
                      type="button"
                      onClick={() => {
                        setIsEditEmployeeModalOpen(true);
                        setEmployeeToEdit(emp);
                      }}
                      className="action-icon-btn"
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      style={{
                        display: emp.role === "OWNER" ? "none" : "flex",
                      }}
                      type="button"
                      className="action-icon-btn btn-delete"
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      <div className="employees-pagination-footer">
        <span className="pagination-info">
          Mostrando 1 a {employees.length} de {employees.length - 1} empleados
        </span>

        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-nav-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            className={`pagination-page-btn ${currentPage === 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button
            type="button"
            className={`pagination-page-btn ${currentPage === 2 ? "active" : ""}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button
            type="button"
            className="pagination-nav-btn"
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
      <AddEmployeeModal
        onSubmit={handleCreateInvite}
        isOpen={createModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isLoading={isLoading}
      />

      <ActiveInvitesModal
        invites={invites}
        isOpen={isInvitesModalOpen}
        onClose={() => setIsInvitesModalOpen(false)}
        onDeleteInvite={handleDeleteInvite}
        isLoading={isLoading}
        onRefresh={refreshInvites}
      />

      <EditEmployeeModal
        employee={employeeToEdit}
        isOpen={isEditEmployeeModalOpen}
        onClose={() => setIsEditEmployeeModalOpen(false)}
        onSave={handleUpdateEmployeePermission}
      />
    </div>
  );
}
