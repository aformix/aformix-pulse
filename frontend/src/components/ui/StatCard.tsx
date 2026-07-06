import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"
import { TrendBadge } from "./TrendBadge"
import { cn } from "../../utils/cn"

interface StatCardProps {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  index?: number
  className?: string
}

export function StatCard({
  title,
  value,
  trend,
  trendLabel = "vs last month",
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  index = 0,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      className={cn(
        "rounded-xl border border-border bg-card p-6 space-y-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>

      <div className="space-y-1">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.07 + 0.2 }}
          className="text-3xl font-bold tracking-tight"
        >
          {value}
        </motion.p>

        {trend !== undefined && (
          <div className="flex items-center gap-2">
            <TrendBadge value={trend} />
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
