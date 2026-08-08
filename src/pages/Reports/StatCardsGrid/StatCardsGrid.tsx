import React from 'react';
import './StatCardsGrid.css';

interface StatCardProps {
  type: 'warning' | 'danger' | 'purple' | 'blue' | 'success';
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
  footer: string;
  trend?: string;
}

const cardsData: StatCardProps[] = [
  { type: 'warning', icon: '⚠️', title: 'Stock bajo', value: 7, subtitle: 'productos', footer: 'Requieren reposición' },
  { type: 'danger', icon: '⛔', title: 'Sin stock', value: 3, subtitle: 'productos', footer: 'Sin unidades disponibles' },
  { type: 'purple', icon: '📅', title: 'Próximos a vencer', value: 12, subtitle: 'productos', footer: 'Vencen en los próximos 30 días' },
  { type: 'blue', icon: '⚡', title: 'Poca rotación', value: 9, subtitle: 'productos', footer: 'Sin movimientos en 60 días' },
  { type: 'success', icon: '👛', title: 'Ganancia del mes', value: '$1,250,400', subtitle: '', footer: 'vs mes anterior', trend: '+18.4%' }
];

export const StatCardsGrid: React.FC = () => {
  return (
    <div className="stat-grid-top-summary-cards-container">
      {cardsData.map((card, idx) => (
        <div key={idx} className={`stat-card-kpi-item-box-wrapper stat-card-type-variant-${card.type}`}>
          <div className="stat-card-top-head-row-section">
            <div className="stat-card-icon-badge-square-element">{card.icon}</div>
            <span className="stat-card-title-header-label-text">{card.title}</span>
          </div>
          <div className="stat-card-central-metric-value-display">
            <span className="stat-card-numeric-highlight-big-font">{card.value}</span>
            {card.subtitle && <span className="stat-card-unit-subtitle-small-tag">{card.subtitle}</span>}
          </div>
          <div className="stat-card-bottom-footer-detail-description">
            {card.trend && <span className="stat-card-positive-trend-percentage-indicator">{card.trend} </span>}
            <span>{card.footer}</span>
          </div>
        </div>
      ))}
    </div>
  );
};