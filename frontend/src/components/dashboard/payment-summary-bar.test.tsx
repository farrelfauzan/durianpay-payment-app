import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PaymentSummaryBar } from './payment-summary-bar'

vi.mock('#/hooks/use-payment-summary', () => ({
  usePaymentSummary: vi.fn(),
}))

import { usePaymentSummary } from '#/hooks/use-payment-summary'

const mockUsePaymentSummary = vi.mocked(usePaymentSummary)

describe('PaymentSummaryBar', () => {
  it('shows loading skeleton when data is loading', () => {
    mockUsePaymentSummary.mockReturnValue({
      total: 0,
      success: 0,
      failed: 0,
      isLoading: true,
    })

    const { container } = render(<PaymentSummaryBar />)
    // Skeleton should be present, not the text values
    expect(screen.queryByText('Total:')).not.toBeInTheDocument()
    expect(container.querySelector('[class*="animate-pulse"]')).toBeInTheDocument()
  })

  it('displays total, success, and failed counts', () => {
    mockUsePaymentSummary.mockReturnValue({
      total: 50,
      success: 40,
      failed: 10,
      isLoading: false,
    })

    render(<PaymentSummaryBar />)

    expect(screen.getByText('Total: 50')).toBeInTheDocument()
    expect(screen.getByText('Success: 40')).toBeInTheDocument()
    expect(screen.getByText('Failed: 10')).toBeInTheDocument()
  })

  it('displays zero counts when no data', () => {
    mockUsePaymentSummary.mockReturnValue({
      total: 0,
      success: 0,
      failed: 0,
      isLoading: false,
    })

    render(<PaymentSummaryBar />)

    expect(screen.getByText('Total: 0')).toBeInTheDocument()
    expect(screen.getByText('Success: 0')).toBeInTheDocument()
    expect(screen.getByText('Failed: 0')).toBeInTheDocument()
  })
})
