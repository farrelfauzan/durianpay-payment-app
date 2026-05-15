import { Link, useRouterState } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "#/components/ui/sidebar"

interface SidebarNavItemProps {
  to: string
  label: string
  icon: LucideIcon
}

export function SidebarNavItem({ to, label, icon: Icon }: SidebarNavItemProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isActive =
    to === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(to)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
        <Link to={to}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
