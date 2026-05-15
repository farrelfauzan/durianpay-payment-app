import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from './middleware'

const API_URL =
  process.env.INTERNAL_API_URL || import.meta.env.VITE_API_BASE_URL!

export type SessionUser = {
  email: string
  role: string
}

export const getSession = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const token = context.accessToken

    if (!token) return null

    try {
      const res = await fetch(`${API_URL}/dashboard/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) return null

      const json = (await res.json()) as {
        email: string
        role: string
      }

      const sessionUser: SessionUser = {
        email: json.email,
        role: json.role,
      }

      return sessionUser
    } catch (error) {
      return null
    }
  })
