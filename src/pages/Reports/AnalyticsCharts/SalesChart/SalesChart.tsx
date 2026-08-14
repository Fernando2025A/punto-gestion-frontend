import "./SalesChart.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartData {
  date: string;
  income: number;
  expenses: number;
}

interface SalesChartProps {
  datas: ChartData[];
}

const formatMoney = (value: number) => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }

  return `$${value}`;
};

// Redondea el máximo del gráfico a un número cómodo
const getChartMax = (value: number) => {
  if (value <= 0) return 100;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;

  let multiplier: number;

  if (normalized <= 1) {
    multiplier = 1;
  } else if (normalized <= 2) {
    multiplier = 2;
  } else if (normalized <= 5) {
    multiplier = 5;
  } else {
    multiplier = 10;
  }

  return multiplier * magnitude;
};

const formatDate = (date: string) => {
  const [, month, day] = date.split("-");

  return `${day}/${month}`;
};

export default function SalesChart({ datas }: SalesChartProps) {
  const maxValue = Math.max(
    ...datas.flatMap((item) => [
      item.income,
      item.expenses,
    ]),
  );

  const chartMax = getChartMax(maxValue);

  return (
    <div className="sales-chart">

      <div className="sales-chart-header">

        <h3>Ventas vs Gastos</h3>

        <div className="sales-chart-legend">

          <div className="legend-item">
            <span className="legend-color income" />
            Ventas
          </div>

          <div className="legend-item">
            <span className="legend-color expense" />
            Gastos
          </div>

        </div>

      </div>

      <ResponsiveContainer width="100%" height={340}>

        <AreaChart data={datas}>

          <defs>

            <linearGradient
              id="incomeFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#21c55d"
                stopOpacity={0.35}
              />

              <stop
                offset="100%"
                stopColor="#21c55d"
                stopOpacity={0}
              />
            </linearGradient>

            <linearGradient
              id="expenseFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#ef4444"
                stopOpacity={0.30}
              />

              <stop
                offset="100%"
                stopColor="#ef4444"
                stopOpacity={0}
              />
            </linearGradient>

          </defs>

          <CartesianGrid
            stroke="#232A36"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#7A8498"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            domain={[0, chartMax]}
            stroke="#7A8498"
            tickFormatter={formatMoney}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid #293040",
              borderRadius: 12,
              color: "#FFF",
            }}
            labelFormatter={(label) => {
              const date = String(label);

              return new Date(
                `${date}T00:00:00`,
              ).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
              });
            }}
            formatter={(value: number) =>
              value.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
              })
            }
          />

          <Area
            type="monotone"
            dataKey="income"
            stroke="#22c55e"
            strokeWidth={3}
            fill="url(#incomeFill)"
          />

          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={3}
            fill="url(#expenseFill)"
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  );
}