import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Shirt,
  Utensils,
  BookOpen,
  Armchair,
  Gamepad2,
  Trophy,
  Package,
  Loader2,
} from "lucide-react";
import "./ProductsPage.css";
import { DeleteProductModal } from "../DeleteProductModal/DeleteProductModal";
import { EditProductModal } from "../EditProductModal/EditProductModal";
import type { ProductFormData } from "../ProductModal/ProductModal";

export type ProductCategory =
  | "ELECTRONICS"
  | "CLOTHING"
  | "FOOD"
  | "BOOKS"
  | "FURNITURE"
  | "TOYS"
  | "SPORTS"
  | "OTHERS";

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  stock: number;
  price: number; // Precio de venta
  purchasePrice?: number; // Precio de compra (si el backend lo devuelve)
  createdAt?: string;
  updatedAt?: string;
  inventoryId?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export function ProductsPage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 8,
    totalItems: 0,
    totalPages: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  //const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [productToEdit, setProductTotEdit] = useState<ProductFormData | null>(
    null,
  );
  const [updating, setIsUpdating] = useState(false);

  const [editModalOpen, setIsEditModalOpen] = useState(false);

  const handleDeleteProduct = async (productId: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${apiUrl}/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el producto");
      }

      // Actualización local: Remover el producto de la lista
      setProducts((prev) => prev.filter((p) => p.id !== productId));

      // Cerrar modal
      setProductToDelete(null);
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

 const handleUpdateProduct = async (formData: ProductFormData) => {
  setIsUpdating(true);

  if (!productToEdit?.id) {
    setIsUpdating(false);
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/products/${productToEdit.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData?.name,
        price: Number(formData?.price),
        stock: Number(formData?.stock),
        category: formData?.category,
        purchasePrice: Number(formData?.purchasePrice),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al actualizar el producto");
    }

    const updatedProduct = await response.json();

    // 1. ACTUALIZAR ESTADO LOCAL: Reemplazamos el producto actualizado en la lista
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      )
    );

    // 2. CERRAR MODAL Y LIMPIAR
    setIsEditModalOpen(false);
    setProductTotEdit(null);

  } catch (error: any) {
    console.error("Error en handleUpdateProduct:", error);
    alert(error.message || "No se pudo actualizar el producto");
  } finally {
    setIsUpdating(false);
  }
};
  // --- Fetching de Datos Reales de la API ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construimos la URL con los Query Params
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        if (selectedCategory !== "ALL") {
          params.append("category", selectedCategory);
        }

        const response = await fetch(
          `${apiUrl}/products?${params.toString()}`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }

        const data = await response.json();
        setProducts(data.data);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || "Ocurrió un error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, limit, selectedCategory, apiUrl]);

  const setEditConfig = (product: ProductFormData, isOpen: boolean) => {
    setProductTotEdit(product);
    setIsEditModalOpen(isOpen);
  };
  // Filtrado local solo por término de búsqueda en pantalla
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Helper para renderizar icono e información según categoría
  const getCategoryConfig = (category: ProductCategory) => {
    switch (category) {
      case "ELECTRONICS":
        return { icon: Laptop, className: "cat-electronics" };
      case "CLOTHING":
        return { icon: Shirt, className: "cat-clothing" };
      case "FOOD":
        return { icon: Utensils, className: "cat-food" };
      case "BOOKS":
        return { icon: BookOpen, className: "cat-books" };
      case "FURNITURE":
        return { icon: Armchair, className: "cat-furniture" };
      case "TOYS":
        return { icon: Gamepad2, className: "cat-toys" };
      case "SPORTS":
        return { icon: Trophy, className: "cat-sports" };
      case "OTHERS":
      default:
        return { icon: Package, className: "cat-others" };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("ARS", "$");
  };

  return (
    <div className="products-container">
      {/* Título */}
      <h1 className="products-title">Productos</h1>

      {/* Barra de Filtros */}
      <div className="products-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-select-wrapper">
          <Filter size={18} className="filter-icon" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1); // Reiniciar a página 1 al cambiar filtro
            }}
          >
            <option value="ALL">Todas las categorías</option>
            <option value="ELECTRONICS">Electrónica</option>
            <option value="CLOTHING">Ropa</option>
            <option value="FOOD">Alimentos</option>
            <option value="BOOKS">Libros</option>
            <option value="FURNITURE">Muebles</option>
            <option value="TOYS">Juguetes</option>
            <option value="SPORTS">Deportes</option>
            <option value="OTHERS">Otros</option>
          </select>
        </div>
      </div>

      {/* Estados de Carga y Error */}
      {loading && (
        <div className="loading-state">
          <Loader2 className="spinner" size={32} />
          <p>Cargando productos...</p>
        </div>
      )}

      {error && <div className="error-state">{error}</div>}

      {/* Grid de Productos Reales */}
      {!loading && !error && (
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p className="no-products">No se encontraron productos.</p>
          ) : (
            filteredProducts.map((product) => {
              const config = getCategoryConfig(product.category);
              const IconComponent = config.icon;

              return (
                <div key={product.id} className="product-card">
                  {/* Header de Tarjeta */}
                  <div className="card-top">
                    <div className={`card-icon-box ${config.className}`}>
                      <IconComponent size={24} />
                    </div>
                    <div className="card-header-info">
                      <div className="card-title-row">
                        <h3 className="product-name">{product.name}</h3>
                        <span className="product-id">ID: {product.id}</span>
                      </div>
                      <div className="card-sub-row">
                        <span className={`category-badge ${config.className}`}>
                          {product.category}
                        </span>
                      </div>
                      <div className="stock-info">
                        <span>Stock: </span>
                        <strong className="stock-count">{product.stock}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Precios */}
                  <div className="card-prices">
                    <div className="price-item">
                      <span className="price-label">Precio de compra</span>
                      <span className="price-value">
                        {formatCurrency(product.purchasePrice || product.price)}
                      </span>
                    </div>
                    <div className="price-item">
                      <span className="price-label">Precio de venta</span>
                      <span className="price-value">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="card-actions">
                    <button
                      onClick={() =>
                        setEditConfig(
                          {
                            id: product.id,
                            category: product.category,
                            name: product.name,
                            price: product.price,
                            purchasePrice:
                              product?.purchasePrice ?? product.price,
                            stock: product.stock,
                          },
                          !editModalOpen,
                        )
                      }
                      className="btn-action edit"
                    >
                      <Pencil size={15} />
                      <span>Editar</span>
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => setProductToDelete(product)}
                    >
                      <Trash2 size={15} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Paginador Dinámico */}
      <div className="pagination-bar">
        <div className="pagination-controls">
          <button
            className="page-btn nav"
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Generar lista de botones de páginas dinámicamente */}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                className={`page-btn ${
                  currentPage === pageNum ? "active" : ""
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ),
          )}

          <button
            className="page-btn nav"
            disabled={currentPage >= pagination.totalPages || loading}
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, pagination.totalPages),
              )
            }
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="items-per-page">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="8">8 por página</option>
            <option value="16">16 por página</option>
            <option value="24">24 por página</option>
          </select>
        </div>
      </div>
      <DeleteProductModal
        isOpen={Boolean(productToDelete)}
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        isDeleting={isDeleting}
      />
      <EditProductModal
        key={productToEdit?.id}
        isOpen={editModalOpen}
        onSubmit={handleUpdateProduct}
        product={productToEdit}
        onClose={() => setIsEditModalOpen(false)}
        isLoading={updating}
      />
    </div>
  );
}
