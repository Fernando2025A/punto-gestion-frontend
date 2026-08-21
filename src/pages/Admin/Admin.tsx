import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiUser,
  FiMail,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiHash,
} from "react-icons/fi";
import "./Admin.css";
import { useAuth } from "../../hooks/useAuth";
import { UpgradePlanModal } from "./UpgradePlanModal/UpgradePlanModal";

const apiUrl = import.meta.env.VITE_API_URL;

export interface AdminBusinessOwnerItem {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  provider: string;
  emailVerified: boolean;
  isTemporaly: boolean;
  expiresAt: string | null;
}

export interface AdminBusinessPlanItem {
  id: number;
  name: string;
  description: string;
  price: string;
}

export interface AdminBusinessUsageItem {
  id: number;
  businessId: number;
  type: string;
  value: number;
  periodStart: string;
  periodEnd: string;
}

export interface AdminBusinessDataItem {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  ownerId: string;
  planId: number;
  createdAt: string;
  updatedAt: string;
  businessUsage: AdminBusinessUsageItem[];
  owner: AdminBusinessOwnerItem;
  plan: AdminBusinessPlanItem;
}

export interface AdminBusinessApiResponseMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminBusinessApiResponse {
  data: AdminBusinessDataItem[];
  meta: AdminBusinessApiResponseMeta;
}

const DEFAULT_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=600&auto=format&fit=crop";

export function Admin() {
  const [businessListData, setBusinessListData] = useState<
    AdminBusinessDataItem[]
  >([]);
  const [paginationMeta, setPaginationMeta] =
    useState<AdminBusinessApiResponseMeta | null>(null);
  const [searchBusinessIdInput, setSearchBusinessIdInput] =
    useState<string>("");
  const [activeSearchId, setActiveSearchId] = useState<string>("");
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [isLoadingBusinessData, setIsLoadingBusinessData] =
    useState<boolean>(true);
  const [fetchBusinessDataError, setFetchBusinessDataError] = useState<
    string | null
  >(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(0);

  const { user } = useAuth();
  
  useEffect(() => {
    fetchBusinessesFromApi(currentPageNumber, activeSearchId);
  }, [activeSearchId, currentPageNumber]);
  if (!user?.isOwner) {
    return <div>No puedes acceder a esta sección</div>;
  }
  const fetchBusinessesFromApi = async (
    page: number,
    businessIdSearch: string,
  ) => {
    try {
      setIsLoadingBusinessData(true);
      setFetchBusinessDataError(null);

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "8");
      if (businessIdSearch.trim() !== "") {
        queryParams.append("businessId", businessIdSearch.trim());
      }

      const response = await fetch(
        `${apiUrl}/admin/business?${queryParams.toString()}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Error al obtener la lista de negocios");
      }

      const responseData: AdminBusinessApiResponse = await response.json();
      setBusinessListData(responseData.data || []);
      setPaginationMeta(responseData.meta || null);
    } catch (error) {
      setFetchBusinessDataError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cargar los datos",
      );
    } finally {
      setIsLoadingBusinessData(false);
    }
  };

  

  const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentPageNumber(1);
    setActiveSearchId(searchBusinessIdInput);
  };

  const handlePaginationPageChange = (newPageNumber: number) => {
    if (
      paginationMeta &&
      newPageNumber >= 1 &&
      newPageNumber <= paginationMeta.totalPages
    ) {
      setCurrentPageNumber(newPageNumber);
    }
  };

  return (
    <div className="admin-business-management-main-page-container">
      {/* Encabezado Principal */}
      <header className="admin-business-management-header-title-container">
        <h1 className="admin-business-management-header-main-title">Admin</h1>
        <p className="admin-business-management-header-subtitle-text">
          Gestión y administración de negocios
        </p>
      </header>

      {/* Tarjeta de Búsqueda */}
      <div className="admin-business-management-search-card-wrapper">
        <label className="admin-business-management-search-input-field-label">
          Buscar negocio por ID
        </label>
        <form
          className="admin-business-management-search-form-control-group"
          onSubmit={handleSearchFormSubmit}
        >
          <input
            type="text"
            className="admin-business-management-search-text-input-field"
            placeholder="Ingrese el ID del negocio"
            value={searchBusinessIdInput}
            onChange={(e) => setSearchBusinessIdInput(e.target.value)}
          />
          <button
            type="submit"
            className="admin-business-management-search-submit-action-button"
          >
            <FiSearch className="admin-business-management-search-submit-button-icon" />
            Buscar
          </button>
        </form>
      </div>

      {/* Estado de Carga o Error */}
      {isLoadingBusinessData && (
        <div className="admin-business-management-loading-state-container">
          <p className="admin-business-management-loading-state-text">
            Cargando negocios...
          </p>
        </div>
      )}

      {fetchBusinessDataError && !isLoadingBusinessData && (
        <div className="admin-business-management-error-state-container">
          <p className="admin-business-management-error-state-text">
            {fetchBusinessDataError}
          </p>
        </div>
      )}

      {/* Grilla de Negocios */}
      {!isLoadingBusinessData && !fetchBusinessDataError && (
        <>
          {businessListData.length === 0 ? (
            <div className="admin-business-management-empty-state-container">
              <p className="admin-business-management-empty-state-text">
                No se encontraron negocios con los criterios de búsqueda.
              </p>
            </div>
          ) : (
            <div className="admin-business-management-cards-grid-layout">
              {businessListData.map((businessItem) => {
                const planNameLower =
                  businessItem.plan?.name?.toLowerCase() || "free";
                return (
                  <article
                    key={businessItem.id}
                    className="admin-business-management-single-card-item"
                  >
                    {/* Imagen del Negocio */}
                    <div className="admin-business-management-card-image-thumbnail-container">
                      <img
                        src={businessItem.imageUrl || DEFAULT_IMAGE_PLACEHOLDER}
                        alt={businessItem.name}
                        className="admin-business-management-card-image-element"
                      />
                    </div>

                    {/* Contenido de la Tarjeta */}
                    <div className="admin-business-management-card-content-body-wrapper">
                      <h2 className="admin-business-management-card-business-name-heading">
                        {businessItem.name}
                      </h2>
                      <p className="admin-business-management-card-business-description-text">
                        {businessItem.description ||
                          "Sin descripción disponible para este negocio."}
                      </p>

                      {/* Estado de la Suscripción y Badge del Plan */}
                      <div className="admin-business-management-card-subscription-badge-row">
                        <span className="admin-business-management-card-subscription-status-label">
                          Suscripción activa
                        </span>
                        <span
                          className={`admin-business-management-card-plan-pill-tag admin-business-management-card-plan-pill-tag--${planNameLower}`}
                        >
                          Plan {businessItem.plan?.name}
                        </span>
                      </div>

                      {/* Información del Propietario */}
                      <div className="admin-business-management-card-owner-details-wrapper">
                        <div className="admin-business-management-card-owner-info-row">
                          <FiUser className="admin-business-management-card-owner-info-icon" />
                          <div className="admin-business-management-card-owner-info-text-group">
                            <span className="admin-business-management-card-owner-role-title">
                              Propietario
                            </span>
                            <span className="admin-business-management-card-owner-name-value">
                              {businessItem.owner?.username ||
                                "Sin propietario"}
                            </span>
                          </div>
                        </div>

                        <div className="admin-business-management-card-owner-info-row">
                          <FiMail className="admin-business-management-card-owner-info-icon" />
                          <span className="admin-business-management-card-owner-email-value">
                            {businessItem.owner?.email ||
                              "Sin correo registrado"}
                          </span>
                        </div>

                        {/* Fila del ID del Negocio */}
                        <div className="admin-business-management-card-owner-info-row">
                          <FiHash className="admin-business-management-card-owner-info-icon" />
                          <span className="admin-business-management-card-business-id-value">
                            ID: {businessItem.id}
                          </span>
                        </div>
                      </div>

                      {/* Botón de Administración */}
                      <button
                        type="button"
                        className="admin-business-management-card-action-administer-button"
                        onClick={() => {setSelectedBusinessId(businessItem.id); setIsModalOpen(true)}}
                      >
                        <FiSettings className="admin-business-management-card-action-administer-icon" />
                        Administrar Plan
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {paginationMeta && paginationMeta.totalPages > 0 && (
            <footer className="admin-business-management-pagination-controls-wrapper">
              <span className="admin-business-management-pagination-summary-text">
                Mostrando {businessListData.length} de {paginationMeta.total}{" "}
                negocios
              </span>

              <div className="admin-business-management-pagination-buttons-group">
                <button
                  type="button"
                  className="admin-business-management-pagination-nav-button"
                  disabled={!paginationMeta.hasPrevPage}
                  onClick={() =>
                    handlePaginationPageChange(currentPageNumber - 1)
                  }
                >
                  <FiChevronLeft />
                </button>

                {Array.from(
                  { length: paginationMeta.totalPages },
                  (_, index) => index + 1,
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`admin-business-management-pagination-page-number-button ${
                      pageNumber === currentPageNumber
                        ? "admin-business-management-pagination-page-number-button--active-state"
                        : ""
                    }`}
                    onClick={() => handlePaginationPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  className="admin-business-management-pagination-nav-button"
                  disabled={!paginationMeta.hasNextPage}
                  onClick={() =>
                    handlePaginationPageChange(currentPageNumber + 1)
                  }
                >
                  <FiChevronRight />
                </button>
              </div>
            </footer>
          )}
        </>
      )}
      <UpgradePlanModal 
        isOpen={isModalOpen}
        businessId={selectedBusinessId}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
