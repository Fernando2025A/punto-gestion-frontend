import React, { useState, useEffect } from "react";
import "./SupplierSelect.css";
import { useAuth } from "../../hooks/useAuth";

// 1. Tipamos la respuesta exacta que envía tu backend
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

interface SuppliersResponse {
  data: Supplier[]
}

interface SupplierSelectProps {
  value?: number | string;
  onChange: (supplierId: number) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export function SupplierSelect({
  value,
  onChange,
  required = false,
  disabled = false,
  label = "Proveedor",
}: SupplierSelectProps) {
  // Guardamos únicamente las propiedades que necesitamos: id y name
  const [suppliers, setSuppliers] = useState<Pick<Supplier, "id" | "name">[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/suppliers/business/${user?.businessId}?page=1&limit=100`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Error al obtener la lista de proveedores");
        }

        const data: SuppliersResponse = await res.json();

        // Mapeamos para extraer únicamente id y name del array recibido
        const mappedSuppliers = data.data.map(({ id, name }) => ({ id, name }));
        setSuppliers(mappedSuppliers);
      } catch (err: any) {
        setError(err.message || "No se pudieron cargar los proveedores");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [user?.businessId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (!isNaN(selectedId)) {
      onChange(selectedId);
    }
  };

  return (
    <div className="dark-form-group">
      {label && (
        <label htmlFor="supplier-select" className="dark-label">
          {label} {required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <div className="dark-select-wrapper">
        <select
          id="supplier-select"
          className={`dark-select ${error ? "input-error" : ""}`}
          value={value ?? ""}
          onChange={handleChange}
          required={required}
          disabled={disabled || loading || !!error}
        >
          <option value="" disabled>
            {loading
              ? "Cargando proveedores..."
              : error
              ? "Error al cargar"
              : "-- Selecciona un proveedor --"}
          </option>

          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>

        <span className="dark-select-arrow">&#9662;</span>
      </div>

      {error && <span className="dark-error-text">{error}</span>}
    </div>
  );
}