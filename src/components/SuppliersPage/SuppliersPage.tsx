import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, Building2, Package } from "lucide-react";
import "./SuppliersPage.css";

export interface Supplier {
  id: number;
  name: string;
  contact: string | null;
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

  // 1. Obtener los proveedores desde la API
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/suppliers`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al obtener la lista de proveedores.");
      const data = await res.json();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // 2. Manejo de eliminación
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a "${name}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSuppliers((prev) => prev.filter((sup) => sup.id !== id));
      } else {
        alert("No se pudo eliminar el proveedor.");
      }
    } catch (err) {
      console.error("Error eliminando el proveedor:", err);
    }
  };

  // 3. Manejo de edición (Placeholder/Handler para integrar con tu modal)
  const handleEdit = (supplier: Supplier) => {
    console.log("Editar proveedor:", supplier);
    // Aquí puedes abrir tu modal de edición pasando el proveedor seleccionado
  };

  // 4. Filtrado por búsqueda
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suppliers, searchTerm]);

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 5. Paginación
  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuppliers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSuppliers, currentPage]);

  return (
    <div className="suppliers-container">
      {/* Header & Acciones principales */}
      <header className="suppliers-header">
        <div>
          <h1 className="suppliers-title">Proveedores</h1>
          <p className="suppliers-subtitle">Gestiona y consulta las entidades de abastecimiento.</p>
        </div>

        <button className="btn-add-supplier" onClick={() => console.log("Nuevo proveedor")}>
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

      {/* Estado de Carga / Error / Vacío */}
      {loading ? (
        <div className="suppliers-state-message">Cargando proveedores...</div>
      ) : error ? (
        <div className="suppliers-state-message error-state">{error}</div>
      ) : paginatedSuppliers.length === 0 ? (
        <div className="suppliers-state-message">
          {searchTerm ? "No se encontraron proveedores coincidentes." : "No hay proveedores registrados."}
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
                    onClick={() => handleEdit(supplier)}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title="Eliminar"
                    onClick={() => handleDelete(supplier.id, supplier.name)}
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
    </div>
  );
}