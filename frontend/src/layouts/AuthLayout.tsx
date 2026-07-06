import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex h-16 items-center justify-between px-6 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">Aformix</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center relative overflow-hidden p-4">
        {/* Ambient Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.15),transparent)]" />

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/40">
        © {new Date().getFullYear()} Aformix. All rights reserved.
      </footer>
    </div>
  );
}
