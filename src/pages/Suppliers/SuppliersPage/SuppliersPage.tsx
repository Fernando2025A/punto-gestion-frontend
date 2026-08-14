import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Building2,
  Package,
} from "lucide-react";
import "./SuppliersPage.css";
import { useToast } from "../../../hooks/useToast";
import { DeleteSupplierModal } from "../../../components/modals/DeleteSupplierModal/DeleteSupplierModal";
import {
  SupplierModal,
  type SupplierFormData,
} from "../../../components/modals/SupplierModal/SupplierModal";
import { useAuth } from "../../../hooks/useAuth";

export interface Supplier {
  id: number;
  name: string;
  contact?: string | null;
  inventoryId: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface SuppliersPaginatedResponse {
  data: Supplier[];
  pagination: PaginationMeta;
}

const ITEMS_PER_PAGE = 6;
const API_URL = import.meta.env.VITE_API_URL;

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // 1. Inicializamos en true por defecto para evitar llamar a setLoading(true) síncronamente en el useEffect
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de control de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Función auxiliar para re-obtener datos en acciones manuales (crear/editar/eliminar)
  const refetchSuppliers = async (page: number, search: string) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(search.trim() ? { search: search.trim() } : {}),
      });

      const res = await fetch(`${API_URL}/suppliers/business/${user?.businessId}?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al obtener la lista de proveedores.");
      }

      const responseData: SuppliersPaginatedResponse = await res.json();
      setSuppliers(responseData.data);
      setPaginationMeta(responseData.pagination);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resetear a página 1 al modificar la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 2. useEffect corregido: No realiza setStates síncronos iniciales
  useEffect(() => {
    const controller = new AbortController();

    async function loadSuppliers() {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
        });

        const res = await fetch(`${API_URL}/suppliers/business/${user?.businessId}?${queryParams.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Error al obtener la lista de proveedores.");
        }

        const responseData: SuppliersPaginatedResponse = await res.json();
        setSuppliers(responseData.data);
        setPaginationMeta(responseData.pagination);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === "AbortError") return;
          setError(err.message);
        } else {
          setError("Error al conectar con el servidor.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadSuppliers();

    return () => {
      controller.abort();
    };
  }, [currentPage, searchTerm, user?.businessId]);

  // Manejo de eliminación
  const handleDelete = async () => {
    if (!selectedSupplier) return false;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}?businessId=${user?.businessId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        showToast("Error al eliminar el proveedor.", "error");
        return false;
      }

      showToast("Proveedor eliminado exitosamente.", "success");
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);

      if (suppliers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        refetchSuppliers(currentPage, searchTerm);
      }

      return true;
    } catch {
      showToast("Error al eliminar el proveedor.", "error");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Manejo de edición
  const handleEdit = async (formData: SupplierFormData) => {
    if (!selectedSupplier) return false;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}?businessId=${user?.businessId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        showToast("Error al actualizar el proveedor.", "error");
        return false;
      }

      showToast("Proveedor actualizado exitosamente.", "success");
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
      refetchSuppliers(currentPage, searchTerm);

      return true;
    } catch {
      showToast("Error al actualizar el proveedor.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejo de creación
  const handleCreate = async (formData: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/suppliers?businessId=${user?.businessId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        showToast("Error al crear el proveedor.", "error");
        return false;
      }

      showToast("Proveedor creado exitosamente.", "success");
      setIsModalOpen(false);
      setCurrentPage(1);
      refetchSuppliers(1, searchTerm);

      return true;
    } catch {
      showToast("Error al crear el proveedor.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="suppliers-container">
      {/* Header */}
      <header className="suppliers-header">
        <div>
          <h1 className="suppliers-title">Proveedores</h1>
          <p className="suppliers-subtitle">
            Gestiona y consulta las entidades de abastecimiento.
          </p>
        </div>

        <button
          className="btn-add-supplier"
          onClick={() => {
            setSelectedSupplier(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Nuevo Proveedor</span>
        </button>
      </header>

      {/* Buscador */}
      <div className="suppliers-search-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por nombre o contacto..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="suppliers-search-input"
        />
      </div>

      {/* Estados */}
      {loading ? (
        <div className="suppliers-state-message">Cargando proveedores...</div>
      ) : error ? (
        <div className="suppliers-state-message error-state">{error}</div>
      ) : suppliers.length === 0 ? (
        <div className="suppliers-state-message">
          {searchTerm
            ? "No se encontraron proveedores coincidentes."
            : "No hay proveedores registrados."}
        </div>
      ) : (
        /* Grilla de Tarjetas */
        <div className="suppliers-grid">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="supplier-card">
              <div className="supplier-card-header">
                <div className="supplier-avatar">
                  <Building2 size={20} />
                </div>
                <div className="supplier-actions">
                  <button
                    className="action-btn edit-btn"
                    title="Editar"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title="Eliminar"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="supplier-card-body">
                <h3 className="supplier-name">{supplier.name}</h3>
                <p className="supplier-contact">
                  {supplier.contact ? supplier.contact : "Sin datos de contacto"}
                </p>
              </div>

              <div className="supplier-card-footer">
                <div className="supplier-badge">
                  <Package size={14} />
                  <span>{supplier._count?.products ?? 0} Productos</span>
                </div>
                <span className="supplier-id">ID: #{supplier.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controles de Paginación */}
      {!loading && suppliers.length > 0 && (
        <div className="suppliers-pagination">
          <span className="pagination-info">
            Página {paginationMeta.page} de {paginationMeta.totalPages} ({paginationMeta.totalItems} registros)
          </span>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage === paginationMeta.totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, paginationMeta.totalPages))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Crear */}
      <SupplierModal
        key={isModalOpen ? "create-modal-open" : "create-modal-closed"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isSubmitting}
        onSubmit={handleCreate}
        title="Nuevo Distribuidor"
      />

      {/* Modal Editar */}
      <SupplierModal
        key={isEditModalOpen ? `edit-modal-${selectedSupplier?.id}` : "edit-modal-closed"}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        isLoading={isSubmitting}
        onSubmit={handleEdit}
        title="Editar Distribuidor"
        supplier={
          selectedSupplier
            ? { name: selectedSupplier.name, contact: selectedSupplier.contact || undefined }
            : null
        }
      />

      {/* Modal Eliminar */}
      <DeleteSupplierModal
        isOpen={isDeleteModalOpen}
        supplierName={selectedSupplier?.name || ""}
        isLoading={isDeleting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSupplier(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default SuppliersPage;