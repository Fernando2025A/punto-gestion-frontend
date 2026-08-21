import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiInfo,
  FiCopy,
  FiCheck,
  FiArrowLeft,
  FiSend,
  FiCreditCard,
  FiLoader,
  FiAlertCircle,
} from 'react-icons/fi';
import './PlanUpgradePaymentModal.css';
import { useAuth } from '../../../../hooks/useAuth';
import { useToast } from '../../../../hooks/useToast';

const apiUrl = import.meta.env.VITE_API_URL;

// Datos bancarios configurables de Punto Gestión
const BANK_TRANSFER_DETAILS = {
  bankName: 'Mercado Pago',
  accountOwner: 'Fernando Ezequiel García Weber',
  cvuNumber: '0000003100031752560159',
  aliasCode: 'fernando-gb',
};

export interface PricingPlanItemData {
  id: number;
  name: string;
  price: string;
  description?: string | null;
}

export interface PlanUpgradePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: PricingPlanItemData | null;
  onSuccessCallback?: () => void;
}

export function PlanUpgradePaymentModal({
  isOpen,
  onClose,
  selectedPlan,
  onSuccessCallback,
}: PlanUpgradePaymentModalProps) {
  const [currentStepNumber, setCurrentStepNumber] = useState<1 | 2>(1);
  const [senderAccountOwnerNameInput, setSenderAccountOwnerNameInput] = useState<string>('');
  const [optionalUserCommentInput, setOptionalUserCommentInput] = useState<string>('');
  const [copiedFieldType, setCopiedFieldType] = useState<'alias' | 'cvu' | null>(null);
  const [isSubmittingRequestState, setIsSubmittingRequestState] = useState<boolean>(false);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

  const { user } = useAuth();
  const { showToast } = useToast();
  // Reiniciar estado al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setCurrentStepNumber(1);
      setSenderAccountOwnerNameInput('');
      setOptionalUserCommentInput('');
      setCopiedFieldType(null);
      setModalErrorMessage(null);
      setIsSubmittingRequestState(false);
    }
  }, [isOpen]);

  if (!isOpen || !selectedPlan) return null;

  const handleCopyToClipboardAction = (textToCopy: string, fieldType: 'alias' | 'cvu') => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedFieldType(fieldType);
    setTimeout(() => setCopiedFieldType(null), 2000);
  };

  const handleSendPaymentRequestFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!senderAccountOwnerNameInput.trim()) {
      setModalErrorMessage('Por favor, ingresa el nombre del titular de la cuenta bancaria de origen.');
      return;
    }

    try {
      setIsSubmittingRequestState(true);
      setModalErrorMessage(null);

      const response = await fetch(`${apiUrl}/subscriptions/upgrade-request/${user?.businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planId: selectedPlan.id,
          alias: senderAccountOwnerNameInput.trim(),
          comment: optionalUserCommentInput.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al procesar la solicitud de cambio de plan.');
      }

      if (onSuccessCallback) {
        onSuccessCallback();
      }
      showToast("Solicitud enviada exitosamente", "success");
      onClose();
    } catch (error) {
      setModalErrorMessage(
        error instanceof Error ? error.message : 'Error de conexión al enviar la solicitud.'
      );
    } finally {
      setIsSubmittingRequestState(false);
    }
  };

  return (
    <div className="punto-gestion-plan-upgrade-modal-overlay-backdrop">
      <div className="punto-gestion-plan-upgrade-modal-dialog-container">
        {/* Encabezado del Modal */}
        <header className="punto-gestion-plan-upgrade-modal-header-container">
          <div className="punto-gestion-plan-upgrade-modal-header-title-group">
            <FiCreditCard className="punto-gestion-plan-upgrade-modal-header-icon" />
            <div>
              <h2 className="punto-gestion-plan-upgrade-modal-header-heading-text">
                Solicitud de Cambio a Plan {selectedPlan.name}
              </h2>
              <p className="punto-gestion-plan-upgrade-modal-header-step-indicator-text">
                Paso {currentStepNumber} de 2: {currentStepNumber === 1 ? 'Información importante' : 'Datos de pago'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="punto-gestion-plan-upgrade-modal-close-icon-button"
            onClick={onClose}
            disabled={isSubmittingRequestState}
          >
            <FiX />
          </button>
        </header>

        {/* Mensaje de Error */}
        {modalErrorMessage && (
          <div className="punto-gestion-plan-upgrade-modal-error-banner-container">
            <FiAlertCircle className="punto-gestion-plan-upgrade-modal-error-banner-icon" />
            <span className="punto-gestion-plan-upgrade-modal-error-banner-message">
              {modalErrorMessage}
            </span>
          </div>
        )}

        {/* PASO 1: Modal Informativo */}
        {currentStepNumber === 1 && (
          <div className="punto-gestion-plan-upgrade-modal-step-one-content-wrapper">
            <div className="punto-gestion-plan-upgrade-modal-info-card-notice-wrapper">
              <FiInfo className="punto-gestion-plan-upgrade-modal-info-card-notice-icon" />
              <div className="punto-gestion-plan-upgrade-modal-info-card-notice-body-group">
                <h3 className="punto-gestion-plan-upgrade-modal-info-card-notice-title">
                  Sistema de pagos por transferencia
                </h3>
                <p className="punto-gestion-plan-upgrade-modal-info-card-notice-paragraph">
                  Actualmente, <strong>Punto Gestión</strong> maneja el sistema de pagos mediante transferencias bancarias.
                </p>
                <p className="punto-gestion-plan-upgrade-modal-info-card-notice-paragraph">
                  Para realizar el cambio de plan, deberá enviar su solicitud especificando el <strong>nombre de origen de tu cuenta bancaria/billetera virtual</strong> y un comentario opcional.
                </p>
                <p className="punto-gestion-plan-upgrade-modal-info-card-notice-paragraph">
                  El cambio puede tomar de <strong>1 a 24 horas</strong> en acreditarse. No te preocupes, sabemos que una mala experiencia puede perjudicar nuestra reputación, por lo que tu solicitud será procesada lo antes posible.
                </p>
              </div>
            </div>

            <footer className="punto-gestion-plan-upgrade-modal-footer-actions-container">
              <button
                type="button"
                className="punto-gestion-plan-upgrade-modal-cancel-button"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="punto-gestion-plan-upgrade-modal-continue-button"
                onClick={() => setCurrentStepNumber(2)}
              >
                Entendido, Continuar
              </button>
            </footer>
          </div>
        )}

        {/* PASO 2: Datos de Transferencia y Formulario */}
        {currentStepNumber === 2 && (
          <form
            className="punto-gestion-plan-upgrade-modal-step-two-form-wrapper"
            onSubmit={handleSendPaymentRequestFormSubmit}
          >
            <div className="punto-gestion-plan-upgrade-modal-step-two-scrollable-body">
              {/* Tarjeta de Datos Bancarios */}
              <div className="punto-gestion-plan-upgrade-modal-bank-details-card-container">
                <h3 className="punto-gestion-plan-upgrade-modal-bank-details-card-heading">
                  Datos para realizar la transferencia
                </h3>

                <div className="punto-gestion-plan-upgrade-modal-bank-details-row-item">
                  <span className="punto-gestion-plan-upgrade-modal-bank-details-label-text">Titular:</span>
                  <span className="punto-gestion-plan-upgrade-modal-bank-details-value-text">
                    {BANK_TRANSFER_DETAILS.accountOwner}
                  </span>
                </div>

                <div className="punto-gestion-plan-upgrade-modal-bank-details-row-item">
                  <span className="punto-gestion-plan-upgrade-modal-bank-details-label-text">Alias:</span>
                  <div className="punto-gestion-plan-upgrade-modal-bank-details-copy-action-group">
                    <span className="punto-gestion-plan-upgrade-modal-bank-details-value-text punto-gestion-plan-upgrade-modal-bank-details-value-text--highlight">
                      {BANK_TRANSFER_DETAILS.aliasCode}
                    </span>
                    <button
                      type="button"
                      className="punto-gestion-plan-upgrade-modal-copy-field-icon-button"
                      onClick={() =>
                        handleCopyToClipboardAction(BANK_TRANSFER_DETAILS.aliasCode, 'alias')
                      }
                      title="Copiar Alias"
                    >
                      {copiedFieldType === 'alias' ? <FiCheck color="#10b981" /> : <FiCopy />}
                    </button>
                  </div>
                </div>

                <div className="punto-gestion-plan-upgrade-modal-bank-details-row-item">
                  <span className="punto-gestion-plan-upgrade-modal-bank-details-label-text">CVU:</span>
                  <div className="punto-gestion-plan-upgrade-modal-bank-details-copy-action-group">
                    <span className="punto-gestion-plan-upgrade-modal-bank-details-value-text punto-gestion-plan-upgrade-modal-bank-details-value-text--monospace">
                      {BANK_TRANSFER_DETAILS.cvuNumber}
                    </span>
                    <button
                      type="button"
                      className="punto-gestion-plan-upgrade-modal-copy-field-icon-button"
                      onClick={() =>
                        handleCopyToClipboardAction(BANK_TRANSFER_DETAILS.cvuNumber, 'cvu')
                      }
                      title="Copiar CVU"
                    >
                      {copiedFieldType === 'cvu' ? <FiCheck color="#10b981" /> : <FiCopy />}
                    </button>
                  </div>
                </div>

                <div className="punto-gestion-plan-upgrade-modal-bank-details-row-item">
                  <span className="punto-gestion-plan-upgrade-modal-bank-details-label-text">Monto:</span>
                  <span className="punto-gestion-plan-upgrade-modal-bank-details-value-text punto-gestion-plan-upgrade-modal-bank-details-value-text--price">
                    USD${selectedPlan.price} / mes (ARS${(Number(selectedPlan.price) * 1560).toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Formulario del Pagador */}
              <div className="punto-gestion-plan-upgrade-modal-form-inputs-group">
                <div className="punto-gestion-plan-upgrade-modal-input-field-container">
                  <label className="punto-gestion-plan-upgrade-modal-input-field-label">
                    Nombre del titular / cuenta de origen <span className="punto-gestion-plan-upgrade-modal-required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    className="punto-gestion-plan-upgrade-modal-text-input-element"
                    placeholder="Ej. juan.perez.mp (Mercado Pago)"
                    value={senderAccountOwnerNameInput}
                    onChange={(e) => setSenderAccountOwnerNameInput(e.target.value)}
                    required
                  />
                </div>

                <div className="punto-gestion-plan-upgrade-modal-input-field-container">
                  <label className="punto-gestion-plan-upgrade-modal-input-field-label">
                    Comentario adicional (opcional)
                  </label>
                  <textarea
                    className="punto-gestion-plan-upgrade-modal-textarea-element"
                    placeholder="Ej. Número de operación, comprobante o detalle de facturación..."
                    rows={3}
                    value={optionalUserCommentInput}
                    onChange={(e) => setOptionalUserCommentInput(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <footer className="punto-gestion-plan-upgrade-modal-footer-actions-container">
              <button
                type="button"
                className="punto-gestion-plan-upgrade-modal-back-button"
                onClick={() => setCurrentStepNumber(1)}
                disabled={isSubmittingRequestState}
              >
                <FiArrowLeft />
                Volver
              </button>
              <button
                type="submit"
                className="punto-gestion-plan-upgrade-modal-submit-button"
                disabled={isSubmittingRequestState}
              >
                {isSubmittingRequestState ? (
                  <>
                    <FiLoader className="punto-gestion-plan-upgrade-modal-spinner-icon" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}