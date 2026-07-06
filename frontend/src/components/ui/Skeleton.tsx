import { cn } from "../../utils/cn"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className
      )}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className="w-full h-64 rounded-lg" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <Skeleton className="h-4 w-4/12" />
            <Skeleton className="h-4 w-2/12" />
            <Skeleton className="h-4 w-2/12" />
            <Skeleton className="h-4 w-2/12" />
            <Skeleton className="h-6 w-16 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
