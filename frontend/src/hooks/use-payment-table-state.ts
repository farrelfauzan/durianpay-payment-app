import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Route } from '#/routes/dashboard/index'
import type { GetDashboardV1PaymentsParams } from '@durianpay/sdk'
import type { PaymentSearchParams } from '#/routes/dashboard/index'

export function usePaymentTableState() {
  const { page, page_size, sort, search } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  // Local state only for the debounced input
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim()
      if (nextSearch !== search) {
        navigate({
          search: (prev: PaymentSearchParams) => ({
            ...prev,
            search: nextSearch,
            page: 1,
          }),
          replace: true,
        })
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [searchInput, search, navigate])

  const queryParams = useMemo<GetDashboardV1PaymentsParams>(() => {
    const params: GetDashboardV1PaymentsParams = {
      page,
      page_size,
      sort,
    }

    if (search !== '') {
      params.search = search
    }

    return params
  }, [page, page_size, sort, search])

  const setPage = (newPage: number) => {
    navigate({
      search: (prev: PaymentSearchParams) => ({ ...prev, page: newPage }),
    })
  }

  const handleSortChange = (value: string) => {
    navigate({
      search: (prev: PaymentSearchParams) => ({
        ...prev,
        sort: value,
        page: 1,
      }),
    })
  }

  const handlePageSizeChange = (value: number) => {
    navigate({
      search: (prev: PaymentSearchParams) => ({
        ...prev,
        page_size: value,
        page: 1,
      }),
    })
  }

  return {
    page,
    setPage,
    pageSize: page_size,
    sort,
    searchInput,
    setSearchInput,
    queryParams,
    handleSortChange,
    handlePageSizeChange,
  }
}
