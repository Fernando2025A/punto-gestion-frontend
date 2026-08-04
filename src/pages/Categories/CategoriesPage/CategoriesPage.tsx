import { useEffect, useState } from "react";
import {
  Smartphone,
  BookOpen,
  Shirt,
  Utensils,
  MoreHorizontal,
  Package,
  RefreshCw,
  Info,
} from "lucide-react";
import "./CategoriesPage.css";

// --- Tipos de datos según tu Backend ---
export interface CategoryResponse {
  _count: {
    category: number;
  };
  category: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/inventory/categories`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al obtener las categorías");
      }

      const data: CategoryResponse[] = await response.json();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/inventory/categories`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al obtener las categorías");
        }

        const data: CategoryResponse[] = await response.json();
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Ocurrió un error inesperado"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  // Mapas de iconos y nombres legibles
  const renderCategoryIcon = (categoryName: string) => {
    const key = categoryName.toUpperCase();
    switch (key) {
      case "ELECTRONICS":
        return <Smartphone className="catpage-card-icon" size={32} />;
      case "BOOKS":
        return <BookOpen className="catpage-card-icon" size={32} />;
      case "CLOTHING":
        return <Shirt className="catpage-card-icon" size={32} />;
      case "FOOD":
        return <Utensils className="catpage-card-icon" size={32} />;
      case "OTHERS":
      default:
        return <MoreHorizontal className="catpage-card-icon" size={32} />;
    }
  };

  const formatCategoryName = (categoryName: string) => {
    const formattedNames: Record<string, string> = {
      ELECTRONICS: "Electrónica",
      BOOKS: "Libros",
      CLOTHING: "Ropa y Calzado",
      FOOD: "Alimentos y Bebidas",
      OTHERS: "Otros",
    };

    return (
      formattedNames[categoryName.toUpperCase()] ||
      categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase()
    );
  };

  return (
    <div className="catpage-container">
      {/* Header */}
      <header className="catpage-header">
        <div>
          <h1 className="catpage-title">Categorías de Productos</h1>
          <p className="catpage-subtitle">
            Resumen de existencias e inventario agrupado por categorías.
          </p>
        </div>
        <button
          type="button"
          className="catpage-btn-refresh"
          disabled={isLoading}
          onClick={fetchCategories}
        >
          <RefreshCw
            size={16}
            className={isLoading ? "catpage-spin" : ""}
          />
          <span>Actualizar</span>
        </button>
      </header>

      {/* Estado de Carga / Error / Vacío */}
      {isLoading ? (
        <div className="catpage-state-card">
          <RefreshCw size={36} className="catpage-spin catpage-state-icon" />
          <p>Cargando categorías...</p>
        </div>
      ) : error ? (
        <div className="catpage-state-card catpage-state-error">
          <Info size={36} className="catpage-state-icon" />
          <p>{error}</p>
          <button
            type="button"
            className="catpage-btn-retry"
            onClick={fetchCategories}
          >
            Reintentar
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="catpage-state-card">
          <Info size={36} className="catpage-state-icon" />
          <p>No hay categorías registradas en el inventario.</p>
        </div>
      ) : (
        /* Grid de Tarjetas */
        <div className="catpage-grid">
          {categories.map((item) => {
            const count = item._count.category;
            return (
              <div key={item.category} className="catpage-card">
                <div className="catpage-card-icon-wrapper">
                  {renderCategoryIcon(item.category)}
                </div>

                <div className="catpage-card-content">
                  <h3 className="catpage-card-title">
                    {formatCategoryName(item.category)}
                  </h3>
                  
                  <div className="catpage-card-badge">
                    <Package size={16} />
                    <span>
                      {count} {count === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}