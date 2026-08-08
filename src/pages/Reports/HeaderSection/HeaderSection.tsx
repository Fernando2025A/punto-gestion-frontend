import React from "react";
import "./HeaderSection.css";

export const HeaderSection: React.FC = () => {
  return (
    <header className="rpt-hdr-main-header-wrapper">
      <div className="rpt-hdr-title-and-subtitle-block">
        <h1 className="rpt-hdr-primary-page-title">Reportes</h1>
        <p className="rpt-hdr-secondary-description-text">
          Visualiza y analiza la información clave de tu inventario y negocio.
        </p>
      </div>
      <div className="rpt-hdr-actions-controls-container">
        <div className="rpt-hdr-date-picker-dropdown-button">
          <span className="rpt-hdr-calendar-icon-symbol">📅</span>
          <span className="rpt-hdr-date-range-label-text">
            01/07/2026 - 31/07/2026
          </span>
          <span className="rpt-hdr-chevron-down-indicator">⌄</span>
        </div>
        <button className="rpt-hdr-export-data-action-button">
          <span className="rpt-hdr-export-icon-symbol">📥</span>
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
};
