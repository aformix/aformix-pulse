import { Loader2 } from "lucide-react"
import { cn } from "../../utils/cn"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-8 w-8 animate-spin text-primary", className)} />
  )
}

export function FullPageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <LoadingSpinner className="h-10 w-10" />
    </div>
  )
}
