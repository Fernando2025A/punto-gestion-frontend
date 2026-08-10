import React, { useMemo } from 'react';
import './DynamicDonutChart.css';

export interface DonutDataItem {
  label: string;
  value: number;
  color: string;
}

export interface ReportSummary {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalOutflows: number;
  costOfGoodsSold: number;
  grossProfit: number;
  netProfit: number;
  salesCount: number;
}

interface DynamicDonutChartProps {
  data?: DonutDataItem[];
  summary?: ReportSummary;
}

const defaultData: DonutDataItem[] = [
  { label: 'Ventas', value: 150400, color: '#1f6beb' },
  { label: 'Ganancias', value: 1250400, color: '#2ea043' },
  { label: 'Gastos', value: 900000, color: '#da3633' },
];

export const DynamicDonutChart: React.FC<DynamicDonutChartProps> = ({
  data,
  summary,
}) => {
  // 1. Transformamos el summary a DonutDataItem[] o usamos los valores por defecto
  const chartData: DonutDataItem[] = useMemo(() => {
    if (data) return data;

    if (summary) {
      return [
        {
          label: 'Ventas',
          value: summary.totalSales,
          color: '#1f6beb', // Azul
        },
        {
          label: 'Costo de Ventas',
          value: summary.costOfGoodsSold,
          color: '#2ea043', // Verde
        },
        {
          label: 'Egresos Totales',
          value: summary.totalOutflows,
          color: '#da3633', // Rojo
        },
      ];
    }

    return defaultData;
  }, [data, summary]);

  // 2. Calcular la suma total (usando solo valores positivos para el gráfico SVG)
  const total = chartData.reduce((acc, item) => acc + Math.max(0, item.value), 0);

  // 3. Formato de moneda estilo ARS
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);

  let cumulativePercent = 0;

  return (
    <div className="analytics-box-card-container donut-chart-wrapper">
      <span className="analytics-box-main-title">Resumen del período</span>
      <div className="donut-chart-flex-layout-content">
        
        {/* Gráfico SVG Dinámico */}
        <div className="donut-visual-svg-circle-container">
          <svg viewBox="0 0 36 36" className="donut-svg-ring-shape">
            {total > 0 &&
              chartData.map((item, index) => {
                const validValue = Math.max(0, item.value);
                const percent = (validValue / total) * 100;
                
                const strokeDasharray = `${percent} ${100 - percent}`;
                const strokeDashoffset = -cumulativePercent;
                
                cumulativePercent += percent;

                return (
                  <path
                    key={index}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="5"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
          </svg>
        </div>

        {/* Leyenda y Totales Dinámicos */}
        <div className="donut-legend-breakdown-details-list">
          {chartData.map((item, index) => {
            const validValue = Math.max(0, item.value);
            const percentage = total > 0 ? Math.round((validValue / total) * 100) : 0;

            return (
              <div key={index} className="donut-legend-row-item">
                <span
                  className="legend-dot-indicator"
                  style={{ backgroundColor: item.color }}
                />
                <span className="legend-label-name">{item.label}</span>
                <span className="legend-value-amount">{formatCurrency(item.value)}</span>
                <span className="legend-percentage-share">{percentage}%</span>
              </div>
            );
          })}

          <div className="donut-total-summary-footer-row">
            <span className="total-label-heading">Total</span>
            <span className="total-value-amount">{formatCurrency(total)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};