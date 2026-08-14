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
  title?: string;
}

const defaultData: DonutDataItem[] = [
  { label: 'Ventas', value: 150400, color: '#1f6beb' },
  { label: 'Costo de Ventas', value: 50400, color: '#2ea043' },
  { label: 'Egresos Totales', value: 40000, color: '#da3633' },
];

export const DynamicDonutChart: React.FC<DynamicDonutChartProps> = ({
  data,
  summary,
  title = 'Resumen del período',
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

  // 2. Suma para dibujar los arcos del SVG
  const svgTotal = chartData.reduce((acc, item) => acc + Math.max(0, item.value), 0);

  // 3. Determinamos la métrica del pie:
  // Si viene `summary`, la cifra destacada es la Ganancia Neta (Net Profit).
  // Si es un gráfico custom (`data`), usaremos la suma convencional.
  const displayTotal = useMemo(() => {
    if (summary) {
      return summary.netProfit ?? (summary.totalSales - (summary.costOfGoodsSold + summary.totalOutflows));
    }
    return svgTotal;
  }, [summary, svgTotal]);

  // 4. Formato de moneda estilo ARS
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);

  let cumulativePercent = 0;

  return (
    <div className="analytics-box-card-container donut-chart-wrapper">
      <span className="analytics-box-main-title">{title}</span>
      <div className="donut-chart-flex-layout-content">
        
        {/* Gráfico SVG Dinámico */}
        <div className="donut-visual-svg-circle-container">
          <svg viewBox="0 0 36 36" className="donut-svg-ring-shape">
            {svgTotal > 0 &&
              chartData.map((item, index) => {
                const validValue = Math.max(0, item.value);
                const percent = (validValue / svgTotal) * 100;
                
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
            const percentage = svgTotal > 0 ? Math.round((validValue / svgTotal) * 100) : 0;

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

          {/* Pie con Ganancia Neta o Total según contexto */}
          <div className="donut-total-summary-footer-row">
            <span className="total-label-heading">
              {summary ? 'Ganancia Neta' : 'Total'}
            </span>
            <span 
              className={`total-value-amount ${
                summary && displayTotal < 0 ? 'negative-balance' : ''
              }`}
            >
              {formatCurrency(displayTotal)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};