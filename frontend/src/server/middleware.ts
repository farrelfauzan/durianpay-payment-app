import { createMiddleware } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const accessToken = getCookie('token') ?? null

    return next({
      context: {
        accessToken,
      },
    })
  },
)
