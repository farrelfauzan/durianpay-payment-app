import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { Moon, Sun } from 'lucide-react'
import { getSession } from '#/server/auth'
import { SidebarDashboard } from '#/components/dashboard/sidebar-dashboard'
import { Button } from '#/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'
import { useThemeStore } from '#/lib/theme'
import { defineAbilityFor } from '#/lib/ability'
import { AbilityContext } from '#/hooks/use-ability'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) {
      throw redirect({
        to: '/login',
      })
    }
    return { user }
  },
  component: DashboardLayout,
  errorComponent: DashboardError,
})

function DashboardLayout() {
  const { user } = Route.useRouteContext()
  const theme = useThemeStore((state) => state.theme)
  const initializeTheme = useThemeStore((state) => state.initializeTheme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'
  const ability = useMemo(
    () => defineAbilityFor(user?.role ?? ''),
    [user?.role],
  )

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <AbilityContext value={ability}>
      <SidebarProvider className="overflow-x-hidden bg-linear-to-b from-[#fdfeff] to-[#f5f8ff] dark:from-[#1a2340] dark:to-[#131b31]">
        <SidebarDashboard user={user} />
        <SidebarInset className="min-h-svh bg-transparent">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 bg-transparent px-4 border-b border-slate-300 dark:border-white/15">
            <SidebarTrigger />
            <span className="text-sm font-medium">Payment Dashboard</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              role="switch"
              aria-checked={isDark}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
              className="ml-auto relative h-8 w-16 rounded-full border-slate-300/75 bg-white/70 px-2 transition-colors dark:border-slate-600/60 dark:bg-slate-900/55"
            >
              <span
                className={`absolute left-1 h-6 w-6 rounded-full shadow-sm transition-transform ${
                  isDark
                    ? 'translate-x-8 bg-[#dbe5ff]'
                    : 'translate-x-0 bg-white'
                }`}
              />
              <Sun className="size-4.5 text-amber-500" />
              <Moon className="ml-auto size-4.5 text-slate-600 dark:text-slate-200" />
            </Button>
          </header>
          <div className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="w-full px-6 py-6">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AbilityContext>
  )
}

function DashboardError({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#fdfeff] to-[#f5f8ff] dark:from-[#1a2340] dark:to-[#131b31] p-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-300/70 bg-white/45 p-8 text-center shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/35">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Link
          to="/dashboard"
          search={{ page: 1, page_size: 10, sort: '-created_at', search: '' }}
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
