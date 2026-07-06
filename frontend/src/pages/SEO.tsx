import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, AlertTriangle, CheckCircle2, Info, ChevronRight,
  ExternalLink, Plus, TrendingUp, TrendingDown, Minus,
  ChevronLeft, RefreshCw, Globe, Loader2
} from "lucide-react"
import { projectsApi, crawlResultsApi, type Project, type CrawlResult } from "../services/api"
import { Badge } from "../components/ui/Badge"
import { HealthScore } from "../components/ui/HealthScore"
import { DetailDrawer } from "../components/ui/DetailDrawer"
import { DonutChartWidget } from "../components/ui/DonutChart"
import { cn } from "../utils/cn"

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "audit" | "crawl" | "keywords"

interface AuditIssue {
  url: string
  severity: "critical" | "warning" | "notice"
  type: string
  detail: string
  crawlResult: CrawlResult
}

// ─── Mock Keyword Data ────────────────────────────────────────────────────────

const mockKeywords = [
  { keyword: "SEO audit tool", position: 3, prevPosition: 7, volume: 12400, url: "/features/audit" },
  { keyword: "rank tracker free", position: 12, prevPosition: 10, volume: 8900, url: "/features/rank-tracker" },
  { keyword: "website crawler", position: 5, prevPosition: 5, volume: 22100, url: "/features/crawler" },
  { keyword: "backlink checker", position: 18, prevPosition: 24, volume: 33200, url: "/features/backlinks" },
  { keyword: "keyword position monitor", position: 9, prevPosition: 11, volume: 5400, url: "/pricing" },
  { keyword: "site health score", position: 2, prevPosition: 4, volume: 3800, url: "/" },
  { keyword: "meta description analyzer", position: 31, prevPosition: 28, volume: 2900, url: "/features/audit" },
  { keyword: "aformix pulse review", position: 1, prevPosition: 1, volume: 1200, url: "/" },
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

function computeIssues(results: CrawlResult[]): AuditIssue[] {
  const issues: AuditIssue[] = []
  results.forEach(r => {
    if (r.error) {
      issues.push({ url: r.url, severity: "critical", type: "Crawl Error", detail: r.error, crawlResult: r })
    }
    if (r.statusCode >= 400) {
      issues.push({ url: r.url, severity: "critical", type: `HTTP ${r.statusCode}`, detail: `Page returned a ${r.statusCode} error status code.`, crawlResult: r })
    }
    if (!r.title) {
      issues.push({ url: r.url, severity: "critical", type: "Missing Title", detail: "Page has no <title> tag.", crawlResult: r })
    }
    if (!r.metaDescription) {
      issues.push({ url: r.url, severity: "warning", type: "Missing Meta Description", detail: "Page has no meta description tag.", crawlResult: r })
    }
    if (r.h1Count === 0) {
      issues.push({ url: r.url, severity: "warning", type: "Missing H1", detail: "Page has no H1 heading.", crawlResult: r })
    }
    if (r.h1Count > 1) {
      issues.push({ url: r.url, severity: "warning", type: "Multiple H1s", detail: `Page has ${r.h1Count} H1 headings (should be exactly 1).`, crawlResult: r })
    }
    if (r.loadTimeMs > 3000) {
      issues.push({ url: r.url, severity: "notice", type: "Slow Load Time", detail: `Page loaded in ${(r.loadTimeMs / 1000).toFixed(1)}s (target: <3s).`, crawlResult: r })
    }
  })
  return issues
}

function computeScore(results: CrawlResult[], issues: AuditIssue[]): number {
  if (results.length === 0) return 0
  const criticals = issues.filter(i => i.severity === "critical").length
  const warnings = issues.filter(i => i.severity === "warning").length
  const notices = issues.filter(i => i.severity === "notice").length
  const penalty = (criticals * 10) + (warnings * 4) + (notices * 1)
  return Math.max(0, Math.min(100, Math.round(100 - (penalty / results.length) * 10)))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeverityIcon({ severity }: { severity: AuditIssue["severity"] }) {
  if (severity === "critical") return <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
  if (severity === "warning") return <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
  return <Info className="w-4 h-4 text-primary shrink-0" />
}

function SeverityBadge({ severity }: { severity: AuditIssue["severity"] }) {
  if (severity === "critical") return <Badge variant="danger">Critical</Badge>
  if (severity === "warning") return <Badge variant="warning">Warning</Badge>
  return <Badge variant="default">Notice</Badge>
}

function StatusCodeBadge({ code }: { code: number }) {
  const color = code < 300 ? "text-success" : code < 400 ? "text-warning" : "text-destructive"
  return <span className={cn("font-mono font-semibold text-sm", color)}>{code}</span>
}

function KeywordDelta({ current, prev }: { current: number; prev: number }) {
  const delta = prev - current // lower position = better
  if (delta > 0) return (
    <span className="flex items-center gap-0.5 text-success text-sm font-semibold">
      <TrendingUp className="w-3.5 h-3.5" />+{delta}
    </span>
  )
  if (delta < 0) return (
    <span className="flex items-center gap-0.5 text-destructive text-sm font-semibold">
      <TrendingDown className="w-3.5 h-3.5" />{delta}
    </span>
  )
  return <span className="flex items-center gap-0.5 text-muted-foreground text-sm"><Minus className="w-3.5 h-3.5" />0</span>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SEO() {
  // Project selection
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [projectsLoading, setProjectsLoading] = useState(true)

  // Tab state
  const [tab, setTab] = useState<Tab>("audit")

  // Crawl data
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [crawlLoading, setCrawlLoading] = useState(false)

  // Detail drawer
  const [drawerResult, setDrawerResult] = useState<CrawlResult | null>(null)

  // Keyword modal
  const [showAddKeyword, setShowAddKeyword] = useState(false)
  const [keywords, setKeywords] = useState(mockKeywords)
  const [newKeyword, setNewKeyword] = useState("")

  // Load projects on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await projectsApi.list()
        setProjects(data.projects)
        if (data.projects.length > 0) setSelectedProjectId(data.projects[0]._id)
      } catch (e) {
        console.error("Failed to load projects", e)
      } finally {
        setProjectsLoading(false)
      }
    }
    load()
  }, [])

  // Load crawl results when project or page changes
  const loadCrawlResults = useCallback(async (projectId: string, page = 1) => {
    if (!projectId) return
    setCrawlLoading(true)
    try {
      const { data } = await crawlResultsApi.list(projectId, page, 15)
      setCrawlResults(data.results)
      setPagination({ page, totalPages: data.pagination.totalPages, total: data.pagination.total })
    } catch (e) {
      console.error("Failed to load crawl results", e)
      setCrawlResults([])
    } finally {
      setCrawlLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedProjectId) loadCrawlResults(selectedProjectId, 1)
  }, [selectedProjectId, loadCrawlResults])

  const issues = computeIssues(crawlResults)
  const score = computeScore(crawlResults, issues)
  const criticals = issues.filter(i => i.severity === "critical").length
  const warnings = issues.filter(i => i.severity === "warning").length
  const notices = issues.filter(i => i.severity === "notice").length

  const issuesDonutData = [
    { name: "Critical", value: criticals || 0, color: "hsl(var(--destructive))" },
    { name: "Warnings", value: warnings || 0, color: "hsl(38, 92%, 50%)" },
    { name: "Notices", value: notices || 0, color: "hsl(var(--primary))" },
  ]

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyword.trim()) return
    setKeywords(prev => [
      { keyword: newKeyword.trim(), position: 0, prevPosition: 0, volume: 0, url: "/" },
      ...prev,
    ])
    setNewKeyword("")
    setShowAddKeyword(false)
  }

  const selectedProject = projects.find(p => p._id === selectedProjectId)

  const tabs: { id: Tab; label: string }[] = [
    { id: "audit", label: "Site Audit" },
    { id: "crawl", label: "Crawl Explorer" },
    { id: "keywords", label: "Keyword Tracker" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold tracking-tight">SEO Analysis</h1>
          <p className="text-muted-foreground mt-1">Audit your site health, explore crawl data, and track keyword rankings.</p>
        </motion.div>

        {/* Project Selector */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          {projectsLoading ? (
            <div className="w-48 h-10 rounded-lg bg-muted animate-pulse" />
          ) : projects.length === 0 ? (
            <a href="/projects" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" /> Add a Project
            </a>
          ) : (
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
            >
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          )}
        </motion.div>
      </div>

      {/* No projects state */}
      {!projectsLoading && projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-card/50"
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4"><Search className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Add a project and run a crawl to start analysing your site's SEO health.</p>
          <a href="/projects" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Add First Project
          </a>
        </motion.div>
      )}

      {/* Tabs */}
      {projects.length > 0 && (
        <>
          <div className="flex items-center gap-1 border-b border-border">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-colors relative",
                  tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── TAB 1: SITE AUDIT ─────────────────────────────── */}
            {tab === "audit" && (
              <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-6">
                {crawlLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : crawlResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-card/50">
                    <RefreshCw className="w-8 h-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Crawl Data</h3>
                    <p className="text-muted-foreground max-w-sm">Go to Projects and click "Crawl Now" on <strong>{selectedProject?.name}</strong> to generate audit data.</p>
                  </div>
                ) : (
                  <>
                    {/* Score + Donut */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4">
                        <p className="text-sm font-medium text-muted-foreground">Site Health Score</p>
                        <HealthScore score={score} size={160} />
                        <p className="text-xs text-muted-foreground text-center">Based on {crawlResults.length} crawled page{crawlResults.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="md:col-span-2">
                        <DonutChartWidget title="Issues Breakdown" data={issuesDonutData} />
                      </div>
                    </div>

                    {/* Issue summary badges */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Critical", count: criticals, color: "bg-destructive/10 text-destructive border-destructive/20" },
                        { label: "Warnings", count: warnings, color: "bg-warning/10 text-warning border-warning/20" },
                        { label: "Notices", count: notices, color: "bg-primary/10 text-primary border-primary/20" },
                      ].map(({ label, count, color }) => (
                        <div key={label} className={cn("rounded-xl border p-4 text-center", color)}>
                          <p className="text-3xl font-bold">{count}</p>
                          <p className="text-sm font-medium mt-1">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Issues table */}
                    {issues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center bg-success/5 border border-success/20 rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-success mb-3" />
                        <p className="font-semibold text-success">No Issues Detected</p>
                        <p className="text-sm text-muted-foreground mt-1">Your crawled pages look great!</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                          <h3 className="text-sm font-semibold">All Issues ({issues.length})</h3>
                        </div>
                        <div className="divide-y divide-border">
                          {issues.map((issue, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                              onClick={() => setDrawerResult(issue.crawlResult)}
                            >
                              <SeverityIcon severity={issue.severity} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium">{issue.type}</span>
                                  <SeverityBadge severity={issue.severity} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{issue.url}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{issue.detail}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── TAB 2: CRAWL EXPLORER ─────────────────────────── */}
            {tab === "crawl" && (
              <motion.div key="crawl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
                {crawlLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : crawlResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-card/50">
                    <RefreshCw className="w-8 h-8 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Crawl Data</h3>
                    <p className="text-muted-foreground max-w-sm">Go to Projects and run a crawl on <strong>{selectedProject?.name}</strong> to explore results.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Crawl Results <span className="text-muted-foreground font-normal">({pagination.total} pages)</span></h3>
                        <button
                          onClick={() => loadCrawlResults(selectedProjectId, pagination.page)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                            <tr>
                              <th className="px-4 py-3 font-medium">URL</th>
                              <th className="px-4 py-3 font-medium">Status</th>
                              <th className="px-4 py-3 font-medium">Title</th>
                              <th className="px-4 py-3 font-medium">Words</th>
                              <th className="px-4 py-3 font-medium">H1s</th>
                              <th className="px-4 py-3 font-medium">Load (ms)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {crawlResults.map((r) => (
                              <tr
                                key={r._id}
                                onClick={() => setDrawerResult(r)}
                                className="hover:bg-muted/20 transition-colors cursor-pointer group"
                              >
                                <td className="px-4 py-3 max-w-[220px]">
                                  <span className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                    {r.url}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <StatusCodeBadge code={r.statusCode} />
                                </td>
                                <td className="px-4 py-3 text-muted-foreground max-w-[160px]">
                                  <span className="line-clamp-1">{r.title || <em className="text-destructive/70">Missing</em>}</span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{r.wordCount}</td>
                                <td className="px-4 py-3">
                                  <span className={cn("font-medium", r.h1Count === 1 ? "text-success" : "text-warning")}>
                                    {r.h1Count}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={cn("font-medium", r.loadTimeMs > 3000 ? "text-destructive" : r.loadTimeMs > 1500 ? "text-warning" : "text-success")}>
                                    {r.loadTimeMs}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={pagination.page <= 1}
                              onClick={() => loadCrawlResults(selectedProjectId, pagination.page - 1)}
                              className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-40"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              disabled={pagination.page >= pagination.totalPages}
                              onClick={() => loadCrawlResults(selectedProjectId, pagination.page + 1)}
                              className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-40"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── TAB 3: KEYWORD TRACKER ────────────────────────── */}
            {tab === "keywords" && (
              <motion.div key="keywords" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{keywords.length} keywords tracked</p>
                  <button
                    onClick={() => setShowAddKeyword(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-md shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" /> Add Keyword
                  </button>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                        <tr>
                          <th className="px-4 py-3 font-medium">Keyword</th>
                          <th className="px-4 py-3 font-medium text-center">Position</th>
                          <th className="px-4 py-3 font-medium text-center">Change</th>
                          <th className="px-4 py-3 font-medium text-right">Volume</th>
                          <th className="px-4 py-3 font-medium">URL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {keywords.map((kw, i) => (
                          <motion.tr
                            key={kw.keyword}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-foreground">{kw.keyword}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn(
                                "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                                kw.position <= 3 ? "bg-success/15 text-success" :
                                kw.position <= 10 ? "bg-primary/15 text-primary" :
                                kw.position <= 20 ? "bg-warning/15 text-warning" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {kw.position || "–"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <KeywordDelta current={kw.position} prev={kw.prevPosition} />
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground font-mono">
                              {kw.volume ? kw.volume.toLocaleString() : "–"}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={kw.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs"
                              >
                                <span className="line-clamp-1">{kw.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Keyword Modal */}
                <AnimatePresence>
                  {showAddKeyword && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <motion.div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowAddKeyword(false)}
                      />
                      <motion.div
                        className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      >
                        <h3 className="text-lg font-semibold mb-4">Track a Keyword</h3>
                        <form onSubmit={handleAddKeyword} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Keyword</label>
                            <input
                              autoFocus
                              required
                              value={newKeyword}
                              onChange={e => setNewKeyword(e.target.value)}
                              placeholder="e.g. best SEO tool 2026"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowAddKeyword(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                              Cancel
                            </button>
                            <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md shadow-primary/20">
                              Add Keyword
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Detail Drawer ─────────────────────────────────────── */}
      <DetailDrawer
        isOpen={!!drawerResult}
        onClose={() => setDrawerResult(null)}
        title={drawerResult?.url ?? ""}
      >
        {drawerResult && (
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center gap-3">
              <StatusCodeBadge code={drawerResult.statusCode} />
              <span className="text-sm text-muted-foreground">HTTP Status</span>
            </div>

            {/* Meta Info */}
            {[
              { label: "Title", value: drawerResult.title || <em className="text-destructive/70">Missing</em> },
              { label: "Meta Description", value: drawerResult.metaDescription || <em className="text-destructive/70">Missing</em> },
              { label: "H1 Count", value: drawerResult.h1Count },
              { label: "Word Count", value: drawerResult.wordCount },
              { label: "Load Time", value: `${drawerResult.loadTimeMs} ms` },
              { label: "Crawled At", value: new Date(drawerResult.createdAt).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm text-foreground">{value}</p>
              </div>
            ))}

            {drawerResult.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-xs font-medium text-destructive mb-1">Crawl Error</p>
                <p className="text-sm text-destructive/80">{drawerResult.error}</p>
              </div>
            )}

            {/* SEO Issues for this URL */}
            {(() => {
              const urlIssues = computeIssues([drawerResult])
              if (urlIssues.length === 0) return (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="text-sm text-success font-medium">No issues found on this page</p>
                </div>
              )
              return (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SEO Issues ({urlIssues.length})</p>
                  {urlIssues.map((issue) => (
                    <div key={`${issue.type}-${issue.url}`} className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
                      <SeverityIcon severity={issue.severity} />
                      <div>
                        <p className="text-sm font-medium">{issue.type}</p>
                        <p className="text-xs text-muted-foreground">{issue.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* External URL link */}
            <a
              href={drawerResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Open Page <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </DetailDrawer>
    </div>
  )
}
