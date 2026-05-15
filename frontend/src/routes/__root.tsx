import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'
import { Toaster } from '#/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '#/components/ui/tooltip'
import { configureSDK } from '@durianpay/sdk'
import { navigateToLogin, setAppNavigate } from '#/lib/auth'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Configure the SDK's shared axios instance once at module load
configureSDK({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  getToken: () => getCookie('token'),
  onUnauthorized: () => navigateToLogin(),
})

interface RouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(() => {
  try {
    const savedTheme = window.localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const useDark = savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark)
    document.documentElement.classList.toggle('dark', useDark)
  } catch {}
})()`

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Payment App' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: () => <div>Page not found</div>,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Scripts />
        <Toaster />
      </body>
    </html>
  )
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  const navigate = useNavigate()

  useEffect(() => {
    setAppNavigate(navigate)
  }, [navigate])

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}
