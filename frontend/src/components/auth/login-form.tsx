import { useState } from 'react'
import { z } from 'zod'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { usePostDashboardV1AuthLogin } from '@durianpay/sdk'
import { Button } from '../ui/button'
import { Field, FieldError } from '../ui/field'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { validateWithZod } from '#/lib/utils'

const emailSchema = z.email({
  error: 'Invalid email address',
})
const passwordSchema = z.string().min(6, {
  error: 'Password must be at least 6 characters',
})

export function LoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loginMutation = usePostDashboardV1AuthLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.token) {
          document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`
        }
        queryClient.invalidateQueries({ queryKey: ['/dashboard/v1/auth/me'] })
        navigate({
          to: '/dashboard',
          search: { page: 1, page_size: 10, sort: '-created_at', search: '' },
        })
      },
    },
  })
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        await loginMutation.mutateAsync({ data: value })
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Login failed'
        setServerError(message)
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-6"
    >
      {serverError && (
        <div className="rounded-lg bg-red-500/15 border border-red-500/25 px-4 py-3 text-sm text-red-300">
          {serverError}
        </div>
      )}

      <form.Field
        name="email"
        validators={{
          onChange: validateWithZod(emailSchema),
        }}
      >
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <Label htmlFor="email" className="text-white/90">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
            />
            {field.state.meta.errors.length > 0 && (
              <FieldError>{field.state.meta.errors[0]}</FieldError>
            )}
          </Field>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: validateWithZod(passwordSchema),
        }}
      >
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <Label htmlFor="password" className="text-white/90">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
            />
            {field.state.meta.errors.length > 0 && (
              <FieldError>{field.state.meta.errors[0]}</FieldError>
            )}
          </Field>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm cursor-pointer transition-all"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
