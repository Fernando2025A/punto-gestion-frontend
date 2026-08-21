import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import './PricingPlansSection.css';
import { Crown } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { PlanUpgradePaymentModal, type PricingPlanItemData } from './PlanUpgradePaymentModal/PlanUpgradePaymentModal';

const apiUrl = import.meta.env.VITE_API_URL;

export interface PricingPlanLimitItem {
  id: number;
  planId: number;
  type: string;
  value: number | null;
}

export interface PricingPlanPermissionItem {
  id: number;
  planId: number;
  permission: string;
}

export interface PricingPlanResponseData {
  id: number;
  name: string;
  description: string | null;
  price: string;
  createdAt: string;
  updatedAt: string;
  limits: PricingPlanLimitItem[];
  permissions: PricingPlanPermissionItem[];
}

export function PricingPlansSection() {
  const [pricingPlansList, setPricingPlansList] = useState<PricingPlanResponseData[]>([]);
  const [isPricingPlansLoading, setIsPricingPlansLoading] = useState<boolean>(true);
  const [pricingPlansFetchError, setPricingPlansFetchError] = useState<string | null>(null);
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanItemData>({
    id: 1,
    name: "",
    price: "0",
    description: ""
  });
  useEffect(() => {
    const fetchPricingPlansFromApi = async () => {
      try {
        setIsPricingPlansLoading(true);
        const response = await fetch(`${apiUrl}/subscriptions`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error('Error al cargar los planes de suscripción');
        }
        const data: PricingPlanResponseData[] = await response.json();
        setPricingPlansList(data);
      } catch (error) {
        setPricingPlansFetchError(
          error instanceof Error ? error.message : 'Error al conectar con el servidor'
        );
      } finally {
        setIsPricingPlansLoading(false);
      }
    };

    fetchPricingPlansFromApi();
  }, []);

  const getLimitValueByType = (plan: PricingPlanResponseData, limitType: string): number | null => {
    const limitObj = plan.limits.find((item) => item.type === limitType);
    return limitObj ? limitObj.value : null;
  };

  const hasSpecificPermission = (
    plan: PricingPlanResponseData,
    permissionKey: string
  ): boolean => {
    return plan.permissions.some((item) => item.permission === permissionKey);
  };

  const formatLimitDisplay = (value: number | null, unitName: string): string => {
    if (value === null) return `${unitName} ilimitados`;
    return `${value} ${unitName}`;
  };

  if (isPricingPlansLoading) {
    return (
      <div className="pricing-plans-section-loading-container">
        <p className="pricing-plans-section-loading-text">Cargando planes disponibles...</p>
      </div>
    );
  }

  if (pricingPlansFetchError) {
    return (
      <div className="pricing-plans-section-error-container">
        <p className="pricing-plans-section-error-text">{pricingPlansFetchError}</p>
      </div>
    );
  }

  return (
    <section className="pricing-plans-main-section-wrapper">
      {/* Encabezado */}
      <header className="pricing-plans-header-content-container">
        <div className="pricing-plans-header-title-group">
          <Crown className="pricing-plans-header-crown-icon" />
          <h1 className="pricing-plans-header-main-heading">Planes y Suscripciones</h1>
        </div>
        <p className="pricing-plans-header-subtitle-description">
          Elige el plan que mejor se adapte a las necesidades de tu negocio.
        </p>
      </header>

      {/* Grid de tarjetas */}
      <div className="pricing-plans-cards-grid-layout">
        {pricingPlansList.map((planItem) => {
          const isCurrentPlan = user?.planName === planItem.name;

          const isFreePlan = planItem.name === 'FREE';
          const isProPlan = planItem.name === 'PRO';
          const isProPlusPlan = planItem.name === 'PRO+';

          const productsLimit = getLimitValueByType(planItem, 'PRODUCTS');
          const employeesLimit = getLimitValueByType(planItem, 'EMPLOYEES');
          const suppliersLimit = getLimitValueByType(planItem, 'SUPPLIERS');
          const movementsLimit = getLimitValueByType(planItem, 'MOVEMENTS');
          const expensesLimit = getLimitValueByType(planItem, 'EXPENSES');
          const invitationsLimit = getLimitValueByType(planItem, 'INVITATIONS');

          const hasExportReportsPermission =
            hasSpecificPermission(planItem, 'EXPORT_REPORTS_PDF') ||
            hasSpecificPermission(planItem, 'EXPORT_REPORTS_EXCEL');

          return (
            <article
              key={planItem.id}
              className={`pricing-plan-card-item-wrapper ${
                isCurrentPlan ? 'pricing-plan-card-item-wrapper--active-user-plan' : ''
              } ${isFreePlan ? 'pricing-plan-card-item-wrapper--free-variant' : ''} ${
                isProPlan ? 'pricing-plan-card-item-wrapper--pro-variant' : ''
              } ${isProPlusPlan ? 'pricing-plan-card-item-wrapper--pro-plus-variant' : ''}`}
            >
              {/* Badge */}
              <div className="pricing-plan-card-header-badge-container">
                <span className="pricing-plan-card-header-badge-pill">
                  {isFreePlan ? 'Plan Gratuito' : planItem.name}
                </span>
              </div>

              {/* Título y Descripción */}
              <h2 className="pricing-plan-card-title-heading">
                {isFreePlan ? 'Gratuito' : planItem.name}
              </h2>
              <p className="pricing-plan-card-description-text">
                {planItem.description || 'Ideal para hacer crecer tu negocio'}
              </p>

              {/* Precio */}
              <div className="pricing-plan-card-price-display-wrapper">
                <span className="pricing-plan-card-price-currency-amount">
                  ${planItem.price}
                </span>
                <span className="pricing-plan-card-price-billing-cycle">/mes</span>
              </div>

              {/* Lista de características */}
              <ul className="pricing-plan-card-features-list-wrapper">
                <li className="pricing-plan-card-feature-item-row">
                  <FiCheckCircle className="pricing-plan-card-feature-icon-enabled" />
                  <span className="pricing-plan-card-feature-label-text">
                    {formatLimitDisplay(productsLimit, 'productos')}
                  </span>
                </li>

                <li className="pricing-plan-card-feature-item-row">
                  <FiCheckCircle className="pricing-plan-card-feature-icon-enabled" />
                  <span className="pricing-plan-card-feature-label-text">
                    {formatLimitDisplay(employeesLimit, 'empleados')}
                  </span>
                </li>

                <li className="pricing-plan-card-feature-item-row">
                  <FiCheckCircle className="pricing-plan-card-feature-icon-enabled" />
                  <span className="pricing-plan-card-feature-label-text">
                    {formatLimitDisplay(suppliersLimit, 'distribuidores')}
                  </span>
                </li>

                <li className="pricing-plan-card-feature-item-row">
                  <FiCheckCircle className="pricing-plan-card-feature-icon-enabled" />
                  <span className="pricing-plan-card-feature-label-text">
                    {formatLimitDisplay(movementsLimit, 'movimientos')}
                  </span>
                </li>

                <li className="pricing-plan-card-feature-item-row">
                  <FiCheckCircle className="pricing-plan-card-feature-icon-enabled" />
                  <span className="pricing-plan-card-feature-label-text">
                    {formatLimitDisplay(expensesLimit, 'gastos operativos')}
                  </span>
                </li>

                <li className="pricing-plan-card-feature-item-row">
                  <FiCheckCircle className="pricing-plan-card-feature-icon-enabled" />
                  <span className="pricing-plan-card-feature-label-text">
                    {invitationsLimit === null
                      ? 'Códigos de invitación ilimitados para el negocio'
                      : `Hasta ${invitationsLimit} códigos de invitación para el negocio`}
                  </span>
                </li>

                <li className="pricing-plan-card-feature-item-row">
                  {hasExportReportsPermission ? (
                    <FiCheckCircle className="pricing-plan-card-feature-icon-enabled" />
                  ) : (
                    <FiXCircle className="pricing-plan-card-feature-icon-disabled" />
                  )}
                  <div className="pricing-plan-card-feature-stacked-label-group">
                    <span className="pricing-plan-card-feature-label-text">
                      Exportación de reportes (PDF/Excel)
                    </span>
                    <span
                      className={`pricing-plan-card-feature-status-text ${
                        hasExportReportsPermission
                          ? 'pricing-plan-card-feature-status-text--included'
                          : 'pricing-plan-card-feature-status-text--not-included'
                      }`}
                    >
                      {hasExportReportsPermission ? 'Incluido' : 'No incluido'}
                    </span>
                  </div>
                </li>
              </ul>

              {/* Botón de Acción Dinámico */}
              <button
                type="button"
                disabled={isCurrentPlan || planItem.name === "FREE"}
                onClick={() => {setIsModalOpen(true); setSelectedPlan({id: planItem.id, name: planItem.name, price: planItem.price, description: planItem.description})}}
                className={`pricing-plan-card-action-button-element ${
                  isCurrentPlan
                    ? 'pricing-plan-card-action-button-element--current-plan'
                    : isProPlan
                    ? 'pricing-plan-card-action-button-element--pro-plan'
                    : 'pricing-plan-card-action-button-element--pro-plus-plan'
                }`}
              >
                {isCurrentPlan  ? 'Plan actual' : planItem.name === "FREE" ? "-" : `Cambiar a ${planItem.name}`}
              </button>
            </article>
          );
        })}
      </div>

      {/* Banner Informativo */}
      <footer className="pricing-plans-footer-info-banner-container">
        <FiInfo className="pricing-plans-footer-info-icon" />
        <p className="pricing-plans-footer-info-text-message">
          Puedes cambiar o cancelar tu plan en cualquier momento. Los cambios se aplicarán al siguiente ciclo de facturación.
        </p>
      </footer>

      <PlanUpgradePaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
      />
    </section>
  );
}
