import React, { useEffect, useState } from 'react';
import './StatCardsGrid.css';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

// 1. Tipado de la respuesta del backend
export interface PeriodRange {
  start: string;
  end: string;
}

export interface CurrentMonthProfits {
  period: PeriodRange;
  totalRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
}

export interface KPIOverviewResponse {
  outOfStockCount: number;
  lowStockCount: number;
  expiringSoonCount: number;
  lowRotationCount: number;
  currentMonthProfits: CurrentMonthProfits;
}

interface StatCardProps {
  type: 'warning' | 'danger' | 'purple' | 'blue' | 'success';
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
  footer: string;
  trend?: string;
}

export const StatCardsGrid: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { showToast } = useToast();

  useEffect(() => {
    if (!user?.businessId) return;

    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiUrl}/reports/resume?businessId=${user.businessId}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          showToast('No se han podido obtener las métricas', 'error');
          return;
        }

        const data: KPIOverviewResponse = await response.json();
        setKpiData(data);
      } catch {
        showToast('Error de conexión al obtener resumen de métricas', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [apiUrl, user?.businessId, showToast]);

  // Formateador de moneda para las ganancias
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);

  // Mapeo dinámico de datos recibidos o valores por defecto durante la carga
  const cardsData: StatCardProps[] = [
    {
      type: 'warning',
      icon: '⚠️',
      title: 'Stock bajo',
      value: loading ? '-' : (kpiData?.lowStockCount ?? 0),
      subtitle: 'productos',
      footer: 'Requieren reposición',
    },
    {
      type: 'danger',
      icon: '⛔',
      title: 'Sin stock',
      value: loading ? '-' : (kpiData?.outOfStockCount ?? 0),
      subtitle: 'productos',
      footer: 'Sin unidades disponibles',
    },
    {
      type: 'purple',
      icon: '📅',
      title: 'Próximos a vencer',
      value: loading ? '-' : (kpiData?.expiringSoonCount ?? 0),
      subtitle: 'productos',
      footer: 'Vencen en los próximos 30 días',
    },
    {
      type: 'blue',
      icon: '⚡',
      title: 'Poca rotación',
      value: loading ? '-' : (kpiData?.lowRotationCount ?? 0),
      subtitle: 'productos',
      footer: 'Sin movimientos en 60 días',
    },
    {
      type: 'success',
      icon: '👛',
      title: 'Ganancia del mes',
      value: loading
        ? '-'
        : formatCurrency(kpiData?.currentMonthProfits.netProfit ?? 0),
      subtitle: '',
      footer: 'Resultado neto del mes',
    },
  ];

  return (
    <div className="stat-grid-top-summary-cards-container">
      {cardsData.map((card, idx) => (
        <div
          key={idx}
          className={`stat-card-kpi-item-box-wrapper stat-card-type-variant-${card.type}`}
        >
          <div className="stat-card-top-head-row-section">
            <div className="stat-card-icon-badge-square-element">{card.icon}</div>
            <span className="stat-card-title-header-label-text">{card.title}</span>
          </div>
          <div className="stat-card-central-metric-value-display">
            <span className="stat-card-numeric-highlight-big-font">{card.value}</span>
            {card.subtitle && (
              <span className="stat-card-unit-subtitle-small-tag">{card.subtitle}</span>
            )}
          </div>
          <div className="stat-card-bottom-footer-detail-description">
            {card.trend && (
              <span className="stat-card-positive-trend-percentage-indicator">
                {card.trend}{' '}
              </span>
            )}
            <span>{card.footer}</span>
          </div>
        </div>
      ))}
    </div>
  );
};