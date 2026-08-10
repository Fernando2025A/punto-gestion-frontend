import React, { useEffect, useState } from 'react';
import './AnalyticsCharts.css';
import SalesChart from './SalesChart/SalesChart';
import { DynamicDonutChart } from './DynamicDonutChart/DynamicDonutChart';
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
  // 1. Guardamos el summary en el estado
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

  const { user } = useAuth(); // Incluye user.businessId 
  const apiUrl = import.meta.env.VITE_API_URL;
  const { showToast } = useToast();

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/business-resume/${user?.businessId}?startDate=2026-08-05&endDate=2026-08-11`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          showToast('No se han podido obtener los datos', 'error');
          return;
        }

        const data: ReportsResponse = await response.json();
        
        // 2. Actualizamos ambos estados
        setChartData(data.chart);
        setSummaryData(data.summary);
      } catch {
        showToast('Error al conectar con el servidor', 'error');
      }
    };

    getData();
  }, [apiUrl, user?.businessId, showToast]);

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

        {/* Gráfico de ventas */}
        <SalesChart datas={chartData} />
      </div>

      {/* 3. Le pasamos el summary al DynamicDonutChart */}
      <DynamicDonutChart summary={summaryData ?? undefined} />
    </div>
  );
};