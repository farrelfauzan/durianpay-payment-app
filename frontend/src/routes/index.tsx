import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <Navigate
      to="/dashboard"
      search={{ page: 1, page_size: 10, sort: '-created_at', search: '' }}
    />
  ),
})
