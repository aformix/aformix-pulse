import { Outlet } from "react-router-dom"
import { Sidebar } from "../components/Sidebar"
import { Topbar } from "../components/Topbar"

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
