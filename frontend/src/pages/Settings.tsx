import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { userApi } from "../services/api"
import { AlertTriangle, User, Lock, Trash2, CheckCircle2 } from "lucide-react"

export function Settings() {
  const { user, updateUser, logout } = useAuth()
  
  // Profile State
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileError, setProfileError] = useState("")

  // Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Delete State
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError("")
    setProfileSuccess("")
    setProfileLoading(true)
    
    try {
      const { data } = await userApi.updateProfile({ name, email })
      updateUser(data.user)
      setProfileSuccess("Profile updated successfully")
      setTimeout(() => setProfileSuccess(""), 3000)
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setProfileLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    setPasswordLoading(true)
    try {
      await userApi.updatePassword({ currentPassword, newPassword })
      setPasswordSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(""), 3000)
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will delete all your projects and data.")
    if (!confirmed) return

    setDeleteLoading(true)
    try {
      await userApi.deleteAccount()
      logout()
    } catch (err) {
      console.error("Failed to delete account", err)
      alert("Failed to delete account. Please try again later.")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Information */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Profile Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your account details and public profile.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
          {profileSuccess && (
            <div className="bg-success/10 text-success p-3 rounded-md text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {profileError}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Full Name</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-md"
              placeholder="John Doe" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Email Address</label>
            <input 
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-md"
              placeholder="john@example.com" 
            />
          </div>
          <button 
            type="submit"
            disabled={profileLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4 disabled:opacity-70"
          >
            {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Security</h3>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
          {passwordSuccess && (
            <div className="bg-success/10 text-success p-3 rounded-md text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {passwordError}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Current Password</label>
            <input 
              required
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">New Password</label>
            <input 
              required
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Confirm New Password</label>
            <input 
              required
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-md"
            />
          </div>
          <button 
            type="submit"
            disabled={passwordLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4 disabled:opacity-70"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="border border-destructive/20 rounded-xl bg-card overflow-hidden">
        <div className="p-6 flex items-center gap-3 border-b border-destructive/20 bg-destructive/5">
          <div className="bg-destructive/10 p-2 rounded-lg text-destructive">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-destructive/80">
              Permanently delete your account and all of your content.
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-4 bg-destructive/5">
          <p className="text-sm text-foreground">
            Once you delete your account, there is no going back. All of your projects, crawl results, and settings will be permanently erased. Please be certain.
          </p>
          <button 
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 disabled:opacity-70"
          >
            {deleteLoading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  )
}
