import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from './login-form'

// Mock SDK login hook
const mockMutateAsync = vi.fn()
vi.mock('@durianpay/sdk', () => ({
  usePostDashboardV1AuthLogin: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    renderWithProviders(<LoginForm />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls login with email and password on submit', async () => {
    mockMutateAsync.mockResolvedValueOnce({})
    const user = userEvent.setup()

    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'cs@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockMutateAsync).toHaveBeenCalledWith({
      data: {
        email: 'cs@test.com',
        password: 'password',
      },
    })
  })

  it('displays server error on failed login', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Invalid credentials'))
    const user = userEvent.setup()

    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'cs@test.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })
})
