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
  FiUser,
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
  | "CASHIER"
  | "STOCKER"
  | "EMPLOYEE";

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
  phoneNumber?: string;
  imageUrl?: string;
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

export interface EmployeeMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface EmployeeResponse {
  data: EmployeeData[];
  meta: EmployeeMeta;
}

export function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [meta, setMeta] = useState<EmployeeMeta>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [createModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false);
  const [invites, setInvites] = useState<ActiveInvite[]>([]);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeData | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const { showToast } = useToast();

  // Carga de empleados con filtros y paginación
  useEffect(() => {
    if (!user?.businessId) return;

    const fetchFilteredEmployees = async () => {
      let endpoint = `${apiUrl}/employees/${user.businessId}?page=${currentPage}&limit=5`;

      if (selectedRole !== "ALL") {
        endpoint += `&role=${selectedRole}`;
      }

      if (selectedStatus === "ACTIVE") {
        endpoint += `&isActive=true`;
      } else if (selectedStatus === "INACTIVE") {
        endpoint += `&isActive=false`;
      }

      try {
        const response = await fetch(endpoint, {
          credentials: "include",
        });

        if (!response.ok) {
          showToast("No se pudo obtener los empleados", "error");
          return;
        }

        const resData: EmployeeResponse = await response.json();
        setEmployees(resData.data);
        setMeta(resData.meta);
      } catch {
        showToast("Error al conectar con el servidor", "error");
      }
    };

    fetchFilteredEmployees();
  }, [apiUrl, user?.businessId, currentPage, selectedRole, selectedStatus, showToast]);

  // Carga inicial de invitaciones activas
  useEffect(() => {
    if (!user?.businessId) return;

    const fetchInvites = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/invites?businessId=${user?.businessId}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          showToast("No se han podido obtener las invitaciones", "error");
          return;
        }

        const data: ActiveInvite[] = await response.json();
        setInvites(data);
      } catch {
        showToast("Error al cargar invitaciones", "error");
      }
    };

    fetchInvites();
  }, [apiUrl, user?.businessId, showToast]);

  const formatDate = (isoString: string): string => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date
      .toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const refreshInvites = async () => {
    const response = await fetch(
      `${apiUrl}/invites?businessId=${user?.businessId}`,
      { credentials: "include" }
    );

    if (response.ok) {
      const data: ActiveInvite[] = await response.json();
      setInvites(data);
    }
  };

  const handleCreateInvite = async (data: CreateInviteFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/invites?businessId=${user?.businessId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        showToast("No se ha podido crear la invitación", "error");
        return;
      }
      showToast("Código generado exitosamente", "success");
      setIsCreateModalOpen(false);
      refreshInvites();
    } catch {
      showToast("Ha ocurrido un error al solicitar código", "error");
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
        }
      );

      if (!res.ok) {
        showToast("No se ha podido eliminar la invitación", "error");
        return;
      }
      showToast("Código eliminado exitosamente", "success");
      refreshInvites();
    } catch {
      showToast("Ha ocurrido un error al eliminar código", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployeePermission = async (data: EditEmployeeUpdateData) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/employees/${data.employeeId}?businessId=${user?.businessId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            permissions: data.permissions,
            role: data.role,
            isActive: data.isActive,
          }),
        }
      );

      if (!res.ok) {
        showToast("No se ha podido actualizar empleado", "error");
        return;
      }
      showToast("Empleado actualizado exitosamente", "success");
      setIsEditEmployeeModalOpen(false);
      setCurrentPage(1);
    } catch {
      showToast("Ha ocurrido un error inesperado", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployeesBySearch = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.user.username.toLowerCase().includes(term) ||
      emp.user.email.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term)
    );
  });

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
          <div className="kpi-value">{meta.total}</div>
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
            {employees.filter((emp) => emp.isActive).length}
          </div>
          <div className="kpi-subtext">En esta página</div>
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
          <div className="kpi-subtext">En esta página</div>
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
          <div className="kpi-subtext">Roles en lista</div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="employees-filters-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-right-group">
          <select
            className="filter-select"
            value={selectedRole}
            onChange={handleRoleFilterChange}
          >
            <option value="ALL">Todos los roles</option>
            <option value="OWNER">Propietario</option>
            <option value="ADMIN">Administrador</option>
            <option value="CASHIER">Cajero</option>
            <option value="STOCKER">Almacenero</option>
            <option value="EMPLOYEE">Empleado</option>
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={handleStatusFilterChange}
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>

          <button type="button" className="btn-filter-trigger">
            <FiFilter /> Filtros
          </button>
        </div>
      </div>

      {/* Tabla de Empleados (Responsive con formato Tarjeta en móviles) */}
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
            {filteredEmployeesBySearch.map((emp) => (
              <tr key={emp.id}>
                <td data-label="Empleado">
                  <div className="employee-info-cell">
                    {emp.user.imageUrl ? (
                      <img
                        src={emp.user.imageUrl}
                        alt={emp.user.username}
                        className="employee-avatar-img"
                      />
                    ) : (
                      <div className="employee-avatar-fallback">
                        <FiUser />
                      </div>
                    )}
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
                <td data-label="Rol">
                  <span className={`role-badge role-badge-${emp.role.toLowerCase()}`}>
                    {emp.role}
                  </span>
                </td>
                <td data-label="Email" className="text-secondary">
                  {emp.user.email}
                </td>
                <td data-label="Teléfono" className="text-secondary">
                  {emp.user.phoneNumber || "Sin teléfono"}
                </td>
                <td data-label="Estado">
                  <span
                    className={`status-pill ${
                      emp.isActive ? "status-active" : "status-inactive"
                    }`}
                  >
                    <span className="status-dot"></span>
                    {emp.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td data-label="Acciones">
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
                        setEmployeeToEdit(emp);
                        setIsEditEmployeeModalOpen(true);
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

      {/* Paginador Dinámico */}
      <div className="employees-pagination-footer">
        <span className="pagination-info">
          Página {meta.page} de {meta.totalPages} ({meta.total} empleados en total)
        </span>

        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-nav-btn"
            disabled={!meta.hasPrevPage}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <FiChevronLeft />
          </button>

          {Array.from({ length: meta.totalPages }, (_, index) => index + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`pagination-page-btn ${
                  currentPage === pageNum ? "active" : ""
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            type="button"
            className="pagination-nav-btn"
            disabled={!meta.hasNextPage}
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

      {employeeToEdit && (
        <EditEmployeeModal
          employee={employeeToEdit}
          isOpen={isEditEmployeeModalOpen}
          onClose={() => setIsEditEmployeeModalOpen(false)}
          onSave={handleUpdateEmployeePermission}
        />
      )}
    </div>
  );
}
