import React, { useEffect, useMemo, useState } from 'react';
import './AnalyticsCharts.css';
import SalesChart from './SalesChart/SalesChart';
import { DynamicDonutChart, type DonutDataItem } from './DynamicDonutChart/DynamicDonutChart';
import type { ChartData } from 'recharts/types/state/chartDataSlice';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

export interface ReportPeriod {
  startDate: string;
  endDate: string;
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

export interface ReportsResponse {
  period: ReportPeriod;
  summary: ReportSummary;
  chart: ChartData[];
}

export const AnalyticsCharts: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [summaryData, setSummaryData] = useState<ReportSummary>({
    costOfGoodsSold: 0,
    grossProfit: 0,
    netProfit: 0,
    salesCount: 0,
    totalExpenses: 0,
    totalOutflows: 0,
    totalPurchases: 0,
    totalSales: 0,
  });

  // Mapeo dinámico para el segundo gráfico (Desglose de Egresos)
  const outflowsData: DonutDataItem[] = useMemo(
    () => [
      { label: 'Compras de Stock', value: summaryData.totalPurchases, color: '#da3633' },
      { label: 'Gastos Operativos', value: summaryData.totalExpenses, color: '#f0883e' },
    ],
    [summaryData.totalPurchases, summaryData.totalExpenses]
  );

  // Función para obtener la fecha de mañana en formato YYYY-MM-DD
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Estado inicial: desde hace 7 días hasta el día de mañana (para cubrir todo el día de hoy)
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState<string>(() => getTomorrowString());

  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { showToast } = useToast();

  const maxAllowedDate = getTomorrowString();

  useEffect(() => {
    if (!user?.businessId || !startDate || !endDate) return;

    const getData = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/business-resume/${user.businessId}?startDate=${startDate}&endDate=${endDate}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          showToast('No se han podido obtener los datos', 'error');
          return;
        }

        const data: ReportsResponse = await response.json();
        setChartData(data.chart);
        setSummaryData(data.summary);
      } catch {
        showToast('Error al conectar con el servidor', 'error');
      }
    };

    getData();
  }, [apiUrl, user?.businessId, startDate, endDate, showToast]);

  return (
    <div className="analytics-section-charts-dual-column-layout">
      {/* Gráfico de Líneas */}
      <div className="analytics-box-card-container line-chart-wrapper">
        <div className="analytics-box-header-title-bar">
          {/* Selector de Rango de Fechas */}
          <div className="analytics-date-filter-wrapper">
            <div className="analytics-date-input-group">
              <label htmlFor="startDate">Desde:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                max={maxAllowedDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="analytics-date-picker-input"
              />
            </div>
            <div className="analytics-date-input-group">
              <label htmlFor="endDate">Hasta:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                max={maxAllowedDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="analytics-date-picker-input"
              />
            </div>
          </div>

          <div className="analytics-box-legend-indicators">
            <span className="legend-item-point legend-color-green">Ventas</span>
            <span className="legend-item-point legend-color-red">Gastos</span>
          </div>
        </div>

        {/* Gráfico de ventas */}
        <SalesChart datas={chartData} />
      </div>

      {/* Columna de Gráficos de Dona */}
      <div className="dynamic-donut-container">
        {/* Gráfico 1: Financiero General */}
        <DynamicDonutChart summary={summaryData} />

        {/* Gráfico 2: Desglose de Egresos */}
        <DynamicDonutChart
          title="Distribución de egresos"
          data={outflowsData}
        />
      </div>
    </div>
  );
};