import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { PaymentTable } from './payment-table'

// Mock dependencies
vi.mock('@durianpay/sdk', () => ({
  useGetDashboardV1Payments: vi.fn(),
}))

vi.mock('#/hooks/use-payment-table-state', () => ({
  usePaymentTableState: vi.fn(),
}))

vi.mock('./payment-summary-bar', () => ({
  PaymentSummaryBar: () => <div data-testid="payment-summary-bar" />,
}))

vi.mock('./payment-pagination', () => ({
  PaymentPagination: () => <div data-testid="payment-pagination" />,
}))

import { useGetDashboardV1Payments } from '@durianpay/sdk'
import { usePaymentTableState } from '#/hooks/use-payment-table-state'

const mockUsePayments = vi.mocked(useGetDashboardV1Payments)
const mockUsePaymentTableState = vi.mocked(usePaymentTableState)

const defaultTableState = {
  page: 1,
  setPage: vi.fn(),
  pageSize: 10,
  sort: '-created_at',
  searchInput: '',
  setSearchInput: vi.fn(),
  queryParams: { page: 1, page_size: 10, sort: '-created_at' },
  handleSortChange: vi.fn(),
  handlePageSizeChange: vi.fn(),
}

describe('PaymentTable', () => {
  beforeEach(() => {
    mockUsePaymentTableState.mockReturnValue(defaultTableState as any)
  })

  it('renders table headers with all required columns', () => {
    mockUsePayments.mockReturnValue({
      data: { payments: [], page: 1, page_size: 10, total: 0, offset: 0, next_page: null, previous_page: null },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any)

    render(<PaymentTable />)

    expect(screen.getByText('Payment ID')).toBeInTheDocument()
    expect(screen.getByText('Merchant')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders payment rows correctly', () => {
    mockUsePayments.mockReturnValue({
      data: {
        payments: [
          { id: 'PAY-001', merchant: 'Tokopedia', amount: '150000', status: 'completed', created_at: '2024-01-15T10:00:00Z' },
          { id: 'PAY-002', merchant: 'Shopee', amount: '75000', status: 'failed', created_at: '2024-01-14T09:00:00Z' },
        ],
        page: 1,
        page_size: 10,
        total: 2,
        offset: 0,
        next_page: null,
        previous_page: null,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any)

    render(<PaymentTable />)

    expect(screen.getByText('PAY-001')).toBeInTheDocument()
    expect(screen.getByText('Tokopedia')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('PAY-002')).toBeInTheDocument()
    expect(screen.getByText('Shopee')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('shows loading skeletons when data is loading', () => {
    mockUsePayments.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: false,
    } as any)

    const { container } = render(<PaymentTable />)
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThan(0)
  })

  it('renders search input', () => {
    mockUsePayments.mockReturnValue({
      data: { payments: [], page: 1, page_size: 10, total: 0, offset: 0, next_page: null, previous_page: null },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any)

    render(<PaymentTable />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })
})
