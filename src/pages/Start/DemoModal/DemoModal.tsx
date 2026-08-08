import React, { useEffect } from 'react';
import './DemoModal.css';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  // Cierra el modal al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="demo-modal-overlay" onClick={isLoading ? undefined : onClose}>
      <div 
        className="demo-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        <div className="demo-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>

        <h3 id="demo-modal-title" className="demo-modal-title">
          Iniciar Demo
        </h3>
        
        <p className="demo-modal-description">
          Estás a punto de ingresar a una cuenta temporal de demostración. Los cambios realizados no se guardarán permanentemente y la información se eliminará automáticamente al finalizar la sesión o al expirar el tiempo de la demo. ¿Continuar?
        </p>

        <div className="demo-modal-actions">
          <button 
            type="button" 
            className="demo-btn demo-btn-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="demo-btn demo-btn-primary" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="demo-spinner-container">
                <span className="demo-spinner" />
                Cargando...
              </span>
            ) : (
              'Continuar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};