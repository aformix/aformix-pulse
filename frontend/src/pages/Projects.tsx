import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Plus, Play, Edit2, Trash2, ExternalLink, X } from "lucide-react"
import { projectsApi, type Project } from "../services/api"
import { Badge } from "../components/ui/Badge"

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [projectForm, setProjectForm] = useState({ _id: "", name: "", domain: "", crawlFrequency: "manual" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const { data } = await projectsApi.list()
      setProjects(data.projects)
    } catch (error) {
      console.error("Failed to fetch projects", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setProjectForm({ _id: "", name: "", domain: "", crawlFrequency: "manual" })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (project: Project) => {
    setModalMode('edit')
    setProjectForm({
      _id: project._id,
      name: project.name,
      domain: project.domain,
      crawlFrequency: project.crawlFrequency
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectForm.name || !projectForm.domain) return

    setIsSubmitting(true)
    try {
      if (modalMode === 'create') {
        await projectsApi.create({
          name: projectForm.name,
          domain: projectForm.domain,
          crawlFrequency: projectForm.crawlFrequency as any
        })
      } else {
        await projectsApi.update(projectForm._id, {
          name: projectForm.name,
          domain: projectForm.domain,
          crawlFrequency: projectForm.crawlFrequency as any
        })
      }
      await fetchProjects()
      setIsModalOpen(false)
    } catch (error) {
      console.error(`Failed to ${modalMode} project`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTriggerCrawl = async (id: string) => {
    try {
      await projectsApi.triggerCrawl(id)
      await fetchProjects()
    } catch (error) {
      console.error("Failed to trigger crawl", error)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This will delete all associated crawl data.")) return
    try {
      await projectsApi.delete(id)
      await fetchProjects()
    } catch (error) {
      console.error("Failed to delete project", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tracked websites and domains.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button 
            onClick={handleOpenCreateModal}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </motion.div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-card/50"
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Get started by adding your first website to track SEO performance and rankings.
          </p>
          <button 
            onClick={handleOpenCreateModal}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Add First Project
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50 overflow-hidden"
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
                      <a 
                        href={project.domain} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 line-clamp-1"
                      >
                        {project.domain.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  
                  <Badge variant={project.status === 'active' ? 'success' : project.status === 'paused' ? 'warning' : 'default'}>
                    {project.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Crawl Frequency</span>
                    <span className="font-medium capitalize">{project.crawlFrequency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Crawl</span>
                    <span className="font-medium text-foreground">
                      {project.lastCrawledAt ? new Date(project.lastCrawledAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  onClick={() => handleTriggerCrawl(project._id)}
                  className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Crawl Now
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEditModal(project)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project._id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Project Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-semibold">
                  {modalMode === 'create' ? 'New Project' : 'Edit Project'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {modalMode === 'create' 
                    ? 'Add a new website to start tracking its SEO performance.'
                    : 'Update your project settings and crawl frequency.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Project Name</label>
                  <input
                    id="name"
                    required
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g. My Awesome Startup"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="domain" className="text-sm font-medium text-foreground">Domain</label>
                  <input
                    id="domain"
                    required
                    value={projectForm.domain}
                    onChange={(e) => setProjectForm({ ...projectForm, domain: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g. https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="frequency" className="text-sm font-medium text-foreground">Crawl Frequency</label>
                  <select
                    id="frequency"
                    value={projectForm.crawlFrequency}
                    onChange={(e) => setProjectForm({ ...projectForm, crawlFrequency: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="manual">Manual (On-demand)</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-primary/20 disabled:opacity-70 flex items-center justify-center min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      modalMode === 'create' ? "Create Project" : "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
