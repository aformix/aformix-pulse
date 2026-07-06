import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "../../utils/cn"

interface TrendBadgeProps {
  value: number
  suffix?: string
  className?: string
}

export function TrendBadge({ value, suffix = "%", className }: TrendBadgeProps) {
  const isPositive = value > 0
  const isNeutral = value === 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
        isNeutral && "bg-muted text-muted-foreground",
        isPositive && "bg-success/15 text-success",
        !isPositive && !isNeutral && "bg-destructive/15 text-destructive",
        className
      )}
    >
      {isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}{value}{suffix}
    </span>
  )
}
