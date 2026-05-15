import { CreditCard, LayoutDashboardIcon, LogOut, type LucideIcon } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { usePostDashboardV1AuthLogout } from '@durianpay/sdk'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '#/components/ui/sidebar'
import { SidebarNavItem } from './sidebar-nav-item'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

interface SidebarDashboardProps {
  user?: {
    email: string
    role: string
  }
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
]

function getUserInitials(email?: string) {
  if (!email) return 'U'

  const localPart = email.split('@')[0]?.trim() ?? ''
  const words = localPart.split(/[._-]+/).filter(Boolean)

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }

  const compact = localPart.replace(/[^a-zA-Z0-9]/g, '')
  return compact.slice(0, 2).toUpperCase() || 'U'
}

export function SidebarDashboard({ user }: SidebarDashboardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutateAsync: logout } = usePostDashboardV1AuthLogout({
    mutation: {
      onSuccess: () => {
        document.cookie = 'token=; path=/; max-age=0'
        queryClient.clear()
        navigate({ to: '/login' })
      },
    },
  })
  const initials = getUserInitials(user?.email)

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="border-none **:data-[sidebar=sidebar]:rounded-3xl **:data-[sidebar=sidebar]:border **:data-[sidebar=sidebar]:border-blue-200/60 dark:**:data-[sidebar=sidebar]:border-white/15 **:data-[sidebar=sidebar]:bg-linear-to-b **:data-[sidebar=sidebar]:from-[#e8f0ff] **:data-[sidebar=sidebar]:to-[#dbe5ff] dark:**:data-[sidebar=sidebar]:from-white/14 dark:**:data-[sidebar=sidebar]:to-white/5 **:data-[sidebar=sidebar]:backdrop-blur-3xl **:data-[sidebar=sidebar]:backdrop-saturate-150 **:data-[sidebar=sidebar]:shadow-[0_18px_48px_rgba(15,23,42,0.18)] dark:**:data-[sidebar=sidebar]:shadow-[0_20px_55px_rgba(2,6,23,0.5)]"
    >
      <SidebarHeader >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Payment Dashboard"
              className="group-data-[collapsible=icon]:justify-center hover:bg-transparent"
            >
              <Link to="/dashboard"
                search={{ page: 1, page_size: 10, sort: '-created_at', search: '' }}
              >
                <CreditCard className="h-4 w-4 shrink-0 text-sidebar-primary" />
                <span className="font-semibold group-data-[collapsible=icon]:hidden">Payment Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-300 dark:border-white/15">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={user?.email ?? 'Profile'}
              className="h-11 group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary">
                {initials}
              </div>
              <div className="flex min-w-0 flex-col text-left group-data-[collapsible=icon]:hidden">
                {/* <span className="truncate text-sm font-medium text-sidebar-foreground">
                  Profile
                </span> */}
                {user?.email && (
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                void logout(undefined)
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
