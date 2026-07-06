import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, ArrowUpRight, BarChart3, Globe, Link as LinkIcon, Search, FolderOpen } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../utils/cn"

import { StatCard } from "../components/ui/StatCard"
import { AreaChartWidget } from "../components/ui/AreaChart"
import { BarChartWidget } from "../components/ui/BarChart"
import { DonutChartWidget } from "../components/ui/DonutChart"
import { Badge } from "../components/ui/Badge"
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from "../components/ui/Skeleton"
import { useAuth } from "../contexts/AuthContext"
import { projectsApi } from "../services/api"

// Mock Data
const trafficData = [
  { date: "Mon", organic: 1200, direct: 400 },
  { date: "Tue", organic: 1400, direct: 430 },
  { date: "Wed", organic: 1100, direct: 380 },
  { date: "Thu", organic: 1600, direct: 500 },
  { date: "Fri", organic: 1800, direct: 600 },
  { date: "Sat", organic: 2200, direct: 750 },
  { date: "Sun", organic: 2400, direct: 800 },
]

const rankingData = [
  { name: "Pos 1-3", count: 145 },
  { name: "Pos 4-10", count: 320 },
  { name: "Pos 11-20", count: 450 },
  { name: "Pos 21-50", count: 890 },
  { name: "Pos 51+", count: 1200 },
]

const issuesData = [
  { name: "Critical", value: 24, color: "hsl(var(--destructive))" },
  { name: "Warnings", value: 145, color: "hsl(var(--warning))" },
  { name: "Notices", value: 380, color: "hsl(var(--primary))" },
]

const topPages = [
  { url: "/blog/seo-tips-2026", visits: 12450, trend: "+12.5%", status: "Good" },
  { url: "/pricing", visits: 8230, trend: "+5.2%", status: "Good" },
  { url: "/features/rank-tracker", visits: 6420, trend: "-2.1%", status: "Needs Work" },
  { url: "/", visits: 4510, trend: "+8.9%", status: "Good" },
  { url: "/about-us", visits: 2100, trend: "0%", status: "Good" },
]

export function Dashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        const { data } = await projectsApi.list()
        setProjectCount(data.projects.length)
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || "User"}. Here's what's happening with your projects today.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mt-4 md:mt-0"
        >
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-muted transition-colors">
            <span>Last 7 Days</span>
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Generate Report
          </button>
        </motion.div>
      </div>

      {/* KPI Cards */}
      {projectCount === 0 && !isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-card/50"
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Welcome to Aformix Pulse</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Get started by adding your first website to track SEO performance and rankings.
          </p>
          <Link 
            to="/projects"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Add First Project
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Link to="/projects">
                  <StatCard
                    title="Total Projects"
                    value={projectCount.toString()}
                    trend={0}
                    icon={FolderOpen}
                    iconColor="text-blue-500"
                    iconBg="bg-blue-500/10"
                    index={0}
                  />
                </Link>
                <StatCard
                  title="Keyword Rankings"
                  value="2,105"
                  trend={4.2}
                  icon={BarChart3}
                  iconColor="text-emerald-500"
                  iconBg="bg-emerald-500/10"
                  index={1}
                />
                <StatCard
                  title="Total Backlinks"
                  value="8,492"
                  trend={-1.5}
                  icon={LinkIcon}
                  iconColor="text-violet-500"
                  iconBg="bg-violet-500/10"
                  index={2}
                />
                <StatCard
                  title="Site Health"
                  value="92%"
                  trend={0}
                  icon={Activity}
                  iconColor="text-primary"
                  iconBg="bg-primary/10"
                  index={3}
                />
              </>
            )}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <AreaChartWidget
              title="Traffic Overview (Organic vs Direct)"
              data={trafficData}
              dataKey="organic"
              color="hsl(var(--primary))"
              gradientId="organicTraffic"
            />
          )}
        </div>
        <div>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <DonutChartWidget
              title="Site Issues Summary"
              data={issuesData}
            />
          )}
        </div>
      </div>

      {/* Charts Row 2 & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <BarChartWidget
              title="Rankings Distribution"
              data={rankingData}
              dataKey="count"
              color="hsl(var(--primary))"
              highlightIndex={0}
            />
          )}
        </div>
        <div className="lg:col-span-2">
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-semibold">Top Performing Pages</h3>
                <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                  View All <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 font-medium">Page URL</th>
                      <th className="px-6 py-3 font-medium">Visits</th>
                      <th className="px-6 py-3 font-medium">Trend</th>
                      <th className="px-6 py-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topPages.map((page, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate">
                          {page.url}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {page.visits.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "font-medium",
                            page.trend.startsWith("+") ? "text-success" : 
                            page.trend.startsWith("-") ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {page.trend}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge variant={page.status === "Good" ? "success" : "warning"}>
                            {page.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  )
}
