import React, { useState } from "react";
import "./HeaderSection.css";

interface HeaderSectionProps {
  startDate: string;
  endDate: string;
  onDateChange?: (range: { startDate: string; endDate: string }) => void;
  onExport?: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  startDate,
  endDate,
  onDateChange,
  onExport,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectPreset = (newStart: string, newEnd: string) => {
    if (onDateChange) {
      onDateChange({ startDate: newStart, endDate: newEnd });
    }
    setIsOpen(false);
  };

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
            className="rpt-hdr-date-picker-dropdown-button"
            onClick={toggleDropdown}
            aria-expanded={isOpen}
          >
            <span className="rpt-hdr-calendar-icon-symbol">📅</span>
            <span className="rpt-hdr-date-range-label-text">
              {startDate} - {endDate}
            </span>
            <span className={`rpt-hdr-chevron-down-indicator ${isOpen ? "open" : ""}`}>
              ⌄
            </span>
          </button>

          {isOpen && (
            <div className="rpt-hdr-date-dropdown-menu">
              <button
                type="button"
                className="rpt-hdr-dropdown-item"
                onClick={() => handleSelectPreset("01/07/2026", "31/07/2026")}
              >
                Julio 2026 (Actual)
              </button>
              <button
                type="button"
                className="rpt-hdr-dropdown-item"
                onClick={() => handleSelectPreset("01/06/2026", "30/06/2026")}
              >
                Junio 2026 (Mes anterior)
              </button>
              <button
                type="button"
                className="rpt-hdr-dropdown-item"
                onClick={() => handleSelectPreset("01/01/2026", "30/06/2026")}
              >
                Últimos 6 meses
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="rpt-hdr-export-data-action-button"
          onClick={onExport}
        >
          <span className="rpt-hdr-export-icon-symbol">📥</span>
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
};