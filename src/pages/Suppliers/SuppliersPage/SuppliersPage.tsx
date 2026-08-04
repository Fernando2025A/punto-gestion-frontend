import { useState, useEffect, useMemo } from "react";
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

const ITEMS_PER_PAGE = 6;
const API_URL = import.meta.env.VITE_API_URL;

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de control de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  // 1. Obtener los proveedores evitando fugas de memoria con abort control
  useEffect(() => {
    let isMounted = true;

    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/suppliers`, { credentials: "include" });
        if (!res.ok) throw new Error("Error al obtener la lista de proveedores.");
        const data = await res.json();
        if (isMounted) setSuppliers(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Error al conectar con el servidor.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuppliers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 2. Manejo de eliminación
  const handleDelete = async () => {
    if (!selectedSupplier) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        showToast("Error al eliminar el proveedor.", "error");
        return false;
      }

      // Actualizar estado local inmediatamente
      setSuppliers((prev) => prev.filter((s) => s.id !== selectedSupplier.id));
      showToast("Proveedor eliminado exitosamente.", "success");
      
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
      return true;
    } catch (error) {
      showToast("Error al eliminar el proveedor.", "error");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // 3. Manejo de edición con actualización local asegurada
  const handleEdit = async (formData: SupplierFormData) => {
    if (!selectedSupplier) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        showToast("Error al actualizar el proveedor.", "error");
        return false;
      }

      const responseData = await response.json();

      // Mantenemos las propiedades que la API pueda omitir (como _count o inventoryId)
      // y sobreescribimos name y contact inmediatamente.
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === selectedSupplier.id) {
            return {
              ...s,
              ...responseData,
              name: formData.name,
              contact: formData.contact ?? null,
              _count: s._count, // Mantenemos el conteo de productos intacto
            };
          }
          return s;
        })
      );

      showToast("Proveedor actualizado exitosamente.", "success");
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
      return true;
    } catch (error) {
      showToast("Error al actualizar el proveedor.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Manejo de creación
  const handleCreate = async (formData: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        showToast("Error al crear el proveedor.", "error");
        return false;
      }

      const newSupplier: Supplier = await response.json();

      // Insertar en estado local
      setSuppliers((prev) => [newSupplier, ...prev]);
      showToast("Proveedor creado exitosamente.", "success");
      setIsModalOpen(false);
      return true;
    } catch (err) {
      showToast("Error al crear el proveedor.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Filtrado y Paginación
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contact &&
          supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suppliers, searchTerm]);

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuppliers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSuppliers, currentPage]);

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="suppliers-search-input"
        />
      </div>

      {/* Estados */}
      {loading ? (
        <div className="suppliers-state-message">Cargando proveedores...</div>
      ) : error ? (
        <div className="suppliers-state-message error-state">{error}</div>
      ) : paginatedSuppliers.length === 0 ? (
        <div className="suppliers-state-message">
          {searchTerm
            ? "No se encontraron proveedores coincidentes."
            : "No hay proveedores registrados."}
        </div>
      ) : (
        /* Grilla de Tarjetas */
        <div className="suppliers-grid">
          {paginatedSuppliers.map((supplier) => (
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
      {!loading && filteredSuppliers.length > 0 && (
        <div className="suppliers-pagination">
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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