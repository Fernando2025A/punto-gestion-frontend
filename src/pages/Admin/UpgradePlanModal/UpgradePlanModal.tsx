import { useEffect, useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import './UpgradePlanModal.css';
import { Crown } from 'lucide-react';

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

export interface AdminBusinessUpgradePlanModalProps {
  businessId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessCallback?: () => void;
}

export function UpgradePlanModal({
  businessId,
  isOpen,
  onClose,
  onSuccessCallback,
}: AdminBusinessUpgradePlanModalProps) {
  const [availablePlansList, setAvailablePlansList] = useState<PricingPlanResponseData[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isLoadingPlansList, setIsLoadingPlansList] = useState<boolean>(false);
  const [isSubmittingUpgradeRequest, setIsSubmittingUpgradeRequest] = useState<boolean>(false);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const [modalSuccessMessage, setModalSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlanId(null);
      setModalErrorMessage(null);
      setModalSuccessMessage(null);
      return;
    }

    const fetchAvailablePlansFromApi = async () => {
      try {
        setIsLoadingPlansList(true);
        setModalErrorMessage(null);

        const response = await fetch(`${apiUrl}/subscriptions`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al cargar la lista de planes disponibles');
        }

        const data: PricingPlanResponseData[] = await response.json();
        setAvailablePlansList(data);
      } catch (error) {
        setModalErrorMessage(
          error instanceof Error ? error.message : 'Error al conectar con el servidor'
        );
      } finally {
        setIsLoadingPlansList(false);
      }
    };

    fetchAvailablePlansFromApi();
  }, [isOpen]);

  if (!isOpen || businessId === null) return null;

  const handleConfirmPlanUpgradeSubmit = async () => {
    if (!selectedPlanId) {
      setModalErrorMessage('Por favor, selecciona un plan para continuar.');
      return;
    }

    try {
      setIsSubmittingUpgradeRequest(true);
      setModalErrorMessage(null);
      setModalSuccessMessage(null);

      const response = await fetch(`${apiUrl}/admin/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: selectedPlanId,
          businessId: businessId,
         }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al actualizar el plan del negocio');
      }

      setModalSuccessMessage('¡El plan del negocio ha sido actualizado con éxito!');
      if (onSuccessCallback) {
        onSuccessCallback();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setModalErrorMessage(
        error instanceof Error ? error.message : 'Error inesperado al procesar la solicitud'
      );
    } finally {
      setIsSubmittingUpgradeRequest(false);
    }
  };

  return (
    <div className="admin-business-upgrade-plan-modal-overlay-backdrop">
      <div className="admin-business-upgrade-plan-modal-dialog-container">
        {/* Encabezado del Modal */}
        <header className="admin-business-upgrade-plan-modal-header-content-wrapper">
          <div className="admin-business-upgrade-plan-modal-header-title-group">
            <Crown className="admin-business-upgrade-plan-modal-header-icon-badge" />
            <div>
              <h2 className="admin-business-upgrade-plan-modal-header-main-heading">
                Mejorar Plan de Negocio
              </h2>
              <p className="admin-business-upgrade-plan-modal-header-subheading-text">
                Negocio ID: <span className="admin-business-upgrade-plan-modal-header-business-id-highlight">#{businessId}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="admin-business-upgrade-plan-modal-header-close-icon-button"
            onClick={onClose}
            disabled={isSubmittingUpgradeRequest}
          >
            <FiX />
          </button>
        </header>

        {/* Mensajes de Alerta */}
        {modalErrorMessage && (
          <div className="admin-business-upgrade-plan-modal-alert-banner-container admin-business-upgrade-plan-modal-alert-banner-container--error-variant">
            <FiAlertCircle className="admin-business-upgrade-plan-modal-alert-banner-icon" />
            <span className="admin-business-upgrade-plan-modal-alert-banner-message-text">
              {modalErrorMessage}
            </span>
          </div>
        )}

        {modalSuccessMessage && (
          <div className="admin-business-upgrade-plan-modal-alert-banner-container admin-business-upgrade-plan-modal-alert-banner-container--success-variant">
            <FiCheckCircle className="admin-business-upgrade-plan-modal-alert-banner-icon" />
            <span className="admin-business-upgrade-plan-modal-alert-banner-message-text">
              {modalSuccessMessage}
            </span>
          </div>
        )}

        {/* Cuerpo del Modal / Selector de Planes */}
        <div className="admin-business-upgrade-plan-modal-body-scrollable-content">
          {isLoadingPlansList ? (
            <div className="admin-business-upgrade-plan-modal-loading-indicator-container">
              <FiLoader className="admin-business-upgrade-plan-modal-loading-spinner-animated-icon" />
              <p className="admin-business-upgrade-plan-modal-loading-status-text">
                Cargando planes de suscripción disponibles...
              </p>
            </div>
          ) : (
            <div className="admin-business-upgrade-plan-modal-plans-selector-grid-layout">
              {availablePlansList.map((planItem) => {
                const isSelected = selectedPlanId === planItem.id;
                const isFreePlan = planItem.name === 'FREE';

                return (
                  <div
                    key={planItem.id}
                    className={`admin-business-upgrade-plan-modal-plan-card-item-selectable ${
                      isSelected
                        ? 'admin-business-upgrade-plan-modal-plan-card-item-selectable--is-selected'
                        : ''
                    }`}
                    onClick={() => setSelectedPlanId(planItem.id)}
                  >
                    <div className="admin-business-upgrade-plan-modal-plan-card-header-badge-row">
                      <span className="admin-business-upgrade-plan-modal-plan-card-title-label">
                        {isFreePlan ? 'Plan Gratuito' : planItem.name}
                      </span>
                      {isSelected && (
                        <FiCheckCircle className="admin-business-upgrade-plan-modal-plan-card-selected-check-icon" />
                      )}
                    </div>

                    <p className="admin-business-upgrade-plan-modal-plan-card-description-text">
                      {planItem.description || 'Acceso completo a características del nivel'}
                    </p>

                    <div className="admin-business-upgrade-plan-modal-plan-card-price-display-wrapper">
                      <span className="admin-business-upgrade-plan-modal-plan-card-price-amount">
                        ${planItem.price}
                      </span>
                      <span className="admin-business-upgrade-plan-modal-plan-card-price-billing-period">
                        /mes
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie de Página / Acciones */}
        <footer className="admin-business-upgrade-plan-modal-footer-actions-container">
          <button
            type="button"
            className="admin-business-upgrade-plan-modal-cancel-dismiss-action-button"
            onClick={onClose}
            disabled={isSubmittingUpgradeRequest}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="admin-business-upgrade-plan-modal-confirm-submit-action-button"
            onClick={handleConfirmPlanUpgradeSubmit}
            disabled={!selectedPlanId || isSubmittingUpgradeRequest || isLoadingPlansList}
          >
            {isSubmittingUpgradeRequest ? (
              <>
                <FiLoader className="admin-business-upgrade-plan-modal-button-spinner-animated-icon" />
                Actualizando...
              </>
            ) : (
              'Confirmar Cambio de Plan'
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
