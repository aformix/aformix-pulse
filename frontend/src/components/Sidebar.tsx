import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { LayoutDashboard, Search, Settings, Sparkles, FolderOpen } from "lucide-react"
import { cn } from "../utils/cn"
import { useAuth } from "../contexts/AuthContext"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "SEO Analysis", href: "/seo", icon: Search },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Aformix</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium line-clamp-1">{user?.name || "User"}</span>
            <span className="text-xs text-muted-foreground">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
