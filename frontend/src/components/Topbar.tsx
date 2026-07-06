import { Menu } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>
        <span className="text-lg font-bold tracking-tight">Aformix</span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        {/* Placeholder for global search */}
        <div className="hidden sm:block">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-muted-foreground sm:text-sm">⌘K</span>
            </div>
            <input
              type="text"
              className="block w-full rounded-md border border-input bg-background py-1.5 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-64"
              placeholder="Search..."
              disabled
            />
          </div>
        </div>
        
        <ThemeToggle />
      </div>
    </header>
  )
}
