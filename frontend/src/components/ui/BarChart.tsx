import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { motion } from "framer-motion"

interface DataPoint {
  [key: string]: string | number
}

interface BarChartWidgetProps {
  title: string
  data: DataPoint[]
  dataKey: string
  xAxisKey?: string
  color?: string
  highlightIndex?: number
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-primary font-semibold">
        {typeof payload[0].value === "number"
          ? payload[0].value.toLocaleString()
          : payload[0].value}
      </p>
    </div>
  )
}

export function BarChartWidget({
  title,
  data,
  dataKey,
  xAxisKey = "name",
  color = "#2563EB",
  highlightIndex,
}: BarChartWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-6">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={highlightIndex === index ? color : `${color}80`}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
