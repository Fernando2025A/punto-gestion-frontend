import React, { useState } from "react";
import {
  FiX,
  FiMail,
  FiCopy,
  FiCheck,
  FiTrash2,
  FiClock,
  FiUser,
  FiHash,
  FiRefreshCw,
} from "react-icons/fi";
import "./ActiveInvitesModal.css";

export interface ActiveInvite {
  id: number;
  code: string;
  role: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  businessId: number;
  createdById: string;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
}

interface ActiveInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invites: ActiveInvite[];
  onDeleteInvite: (inviteId: number) => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
}

export const ActiveInvitesModal: React.FC<ActiveInvitesModalProps> = ({
  isOpen,
  onClose,
  invites,
  onDeleteInvite,
  onRefresh,
  isLoading = false,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDeleteInvite(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Formatear fechas ISO a hora local
  const formatExpiration = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isRefreshingActive = isRefreshing || isLoading;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container dark-theme active-invites-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-wrapper purple">
              <FiMail className="header-icon" />
            </div>
            <div>
              <h2>Invitaciones Activas</h2>
              <p>Códigos vigentes disponibles para unirse al negocio</p>
            </div>
          </div>
          <div className="header-actions">
            {onRefresh && (
              <button
                type="button"
                className="refresh-btn"
                title="Actualizar invitaciones"
                onClick={handleRefresh}
                disabled={isRefreshingActive}
              >
                <FiRefreshCw className={isRefreshingActive ? "spin" : ""} />
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* Cuerpo / Lista */}
        <div className="modal-body">
          {invites.length === 0 ? (
            <div className="empty-state">
              <FiMail className="empty-icon" />
              <p className="empty-title">Sin invitaciones pendientes</p>
              <p className="empty-subtitle">
                No hay ningún código de invitación activo en este momento.
              </p>
            </div>
          ) : (
            <div className="invites-list">
              {invites.map((invite) => (
                <div key={invite.id} className="invite-card">
                  {/* Columna Izquierda: Código y Rol */}
                  <div className="invite-main-info">
                    <div className="code-badge">
                      <span className="code-text">{invite.code}</span>
                      <button
                        className="copy-btn"
                        title="Copiar código"
                        onClick={() => handleCopyCode(invite.code, invite.id)}
                      >
                        {copiedId === invite.id ? (
                          <FiCheck className="success-icon" />
                        ) : (
                          <FiCopy />
                        )}
                      </button>
                    </div>

                    <div className="invite-details">
                      <span className={`role-pill role-${invite.role.toLowerCase()}`}>
                        {invite.role}
                      </span>
                      <span className="detail-item">
                        <FiHash className="detail-icon" /> Usos:{" "}
                        <strong>
                          {invite.usedCount}/{invite.maxUses}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Columna Central: Metadata */}
                  <div className="invite-meta">
                    <span className="meta-item">
                      <FiClock className="meta-icon" /> Expira a las:{" "}
                      <strong>{formatExpiration(invite.expiresAt)}</strong>
                    </span>
                    <span className="meta-item">
                      <FiUser className="meta-icon" /> Creado por:{" "}
                      <strong>{invite.createdBy.username}</strong>
                    </span>
                  </div>

                  {/* Columna Derecha: Eliminar */}
                  <div className="invite-actions">
                    <button
                      className="delete-btn"
                      title="Revocar invitación"
                      disabled={deletingId === invite.id || isLoading}
                      onClick={() => handleDelete(invite.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};