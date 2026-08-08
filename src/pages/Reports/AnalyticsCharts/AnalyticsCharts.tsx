import React from 'react';
import './AnalyticsCharts.css';
import SalesChart from '../SalesChart/SalesChart';

export const AnalyticsCharts: React.FC = () => {
  return (
    <div className="analytics-section-charts-dual-column-layout">
      {/* Gráfico de Líneas */}
      <div className="analytics-box-card-container line-chart-wrapper">
        <div className="analytics-box-header-title-bar">
          <span className="analytics-box-main-title">Ganancias vs Gastos (Último mes)</span>
          <div className="analytics-box-legend-indicators">
            <span className="legend-item-point legend-color-green">Ganancias</span>
            <span className="legend-item-point legend-color-red">Gastos</span>
          </div>
        </div>

        {/* Mock de Gráficos mediante SVG */}
        <SalesChart />
      </div>

      {/* Gráfico Donut */}
      <div className="analytics-box-card-container donut-chart-wrapper">
        <span className="analytics-box-main-title">Resumen del período</span>
        <div className="donut-chart-flex-layout-content">
          <div className="donut-visual-svg-circle-container">
            <svg viewBox="0 0 36 36" className="donut-svg-ring-shape">
              <path strokeDasharray="52, 100" stroke="#1f6beb" strokeWidth="5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path strokeDasharray="30, 100" strokeDashoffset="-52" stroke="#2ea043" strokeWidth="5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path strokeDasharray="18, 100" strokeDashoffset="-82" stroke="#da3633" strokeWidth="5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>

          <div className="donut-legend-breakdown-details-list">
            <div className="donut-legend-row-item">
              <span className="legend-dot-indicator dot-blue"></span>
              <span className="legend-label-name">Ventas</span>
              <span className="legend-value-amount">$2,150,400</span>
              <span className="legend-percentage-share">52%</span>
            </div>
            <div className="donut-legend-row-item">
              <span className="legend-dot-indicator dot-green"></span>
              <span className="legend-label-name">Ganancias</span>
              <span className="legend-value-amount">$1,250,400</span>
              <span className="legend-percentage-share">30%</span>
            </div>
            <div className="donut-legend-row-item">
              <span className="legend-dot-indicator dot-red"></span>
              <span className="legend-label-name">Gastos</span>
              <span className="legend-value-amount">$900,000</span>
              <span className="legend-percentage-share">18%</span>
            </div>

            <div className="donut-total-summary-footer-row">
              <span className="total-label-heading">Total</span>
              <span className="total-value-amount">$2,150,400</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};