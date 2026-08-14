import React, { useState } from "react";
import "./HeaderSection.css";

interface HeaderSectionProps {
  onDateChange?: (range: { startDate: string; endDate: string }) => void;
  onExport?: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  onExport,
}) => {
  return (
    <header className="rpt-hdr-main-header-wrapper">
      <div className="rpt-hdr-title-and-subtitle-block">
        <h1 className="rpt-hdr-primary-page-title">Reportes</h1>
        <p className="rpt-hdr-secondary-description-text">
          Visualiza y analiza la información clave de tu inventario y negocio.
        </p>
      </div>
      <div className="rpt-hdr-actions-controls-container">
        <div className="rpt-hdr-date-picker-container" style={{ position: "relative" }}>
        <button
          type="button"
          className="rpt-hdr-export-data-action-button"
          onClick={onExport}
        >
          <span className="rpt-hdr-export-icon-symbol">📥</span>
          <span>Exportar</span>
        </button>
        </div>
      </div>
    </header>
  );
};