import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center space-y-6">
        <h1 className="text-8xl font-bold text-slate-800/90 dark:text-white/90 tracking-tight">404</h1>
        <p className="text-xl text-slate-600 dark:text-white/70">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="pt-4">
          <Link
            to="/dashboard"
            search={{ page: 1, page_size: 10, sort: '-created_at', search: '' }}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900/10 border border-slate-300 dark:bg-white/10 dark:border-white/20 px-6 py-3 text-sm font-medium text-slate-800 dark:text-white backdrop-blur-xl transition hover:bg-slate-900/20 dark:hover:bg-white/20"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
