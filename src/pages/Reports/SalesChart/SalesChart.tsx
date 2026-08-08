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

const data = [
  { day: "1 Jul", income: 22000, expenses: 150000 },
  { day: "5 Jul", income: 310000, expenses: 145000 },
  { day: "8 Jul", income: 295000, expenses: 165000 },
  { day: "12 Jul", income: 420000, expenses: 195000 },
  { day: "15 Jul", income: 390000, expenses: 210000 },
  { day: "19 Jul", income: 255000, expenses: 250000 },
  { day: "22 Jul", income: 470000, expenses: 260000 },
  { day: "26 Jul", income: 485000, expenses: 275000 },
  { day: "31 Jul", income: 510000, expenses: 325000 },
];

const formatMoney = (value: number) => {
  if (value >= 1000) {
    return `$${value / 1000}k`;
  }

  return `$${value}`;
};

export default function SalesChart() {
  return (
    <div className="sales-chart">

      <div className="sales-chart-header">

        <h3>Ganancias vs Gastos (Último mes)</h3>

        <div className="sales-chart-legend">

          <div className="legend-item">
            <span className="legend-color income" />
            Ganancias
          </div>

          <div className="legend-item">
            <span className="legend-color expense" />
            Gastos
          </div>

        </div>

      </div>

      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data}>

          <defs>

            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#21c55d" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#21c55d" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.30} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>

          </defs>

          <CartesianGrid
            stroke="#232A36"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            stroke="#7A8498"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
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