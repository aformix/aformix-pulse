import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { motion } from "framer-motion"

interface DataPoint {
  name: string
  value: number
  color: string
}

interface DonutChartWidgetProps {
  title: string
  data: DataPoint[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as DataPoint

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-sm flex items-center gap-2">
      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
      <span className="font-medium text-foreground">{data.name}:</span>
      <span className="font-semibold">{data.value.toLocaleString()}</span>
    </div>
  )
}

export function DonutChartWidget({ title, data }: DonutChartWidgetProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card p-6 flex flex-col"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      
      <div className="relative flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {total.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground font-medium">Total</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground truncate">{item.name}</span>
            <span className="font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
