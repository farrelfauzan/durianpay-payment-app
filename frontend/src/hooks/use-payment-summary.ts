import { useMemo } from 'react'
import {
  useGetDashboardV1Payments,
  type GetDashboardV1PaymentsParams,
} from '@durianpay/sdk'

export function usePaymentSummary() {
  const baseParams = useMemo<GetDashboardV1PaymentsParams>(
    () => ({ page: 1, page_size: 1 }),
    [],
  )

  const { data: totalSummary, isLoading: isTotalLoading } =
    useGetDashboardV1Payments(baseParams)
  const { data: successSummary, isLoading: isSuccessLoading } =
    useGetDashboardV1Payments({ ...baseParams, status: 'completed' })
  const { data: processingSummary, isLoading: isProcessingLoading } =
    useGetDashboardV1Payments({ ...baseParams, status: 'processing' })
  const { data: failedSummary, isLoading: isFailedLoading } =
    useGetDashboardV1Payments({ ...baseParams, status: 'failed' })

  return {
    total: totalSummary?.total ?? 0,
    success: successSummary?.total ?? 0,
    processing: processingSummary?.total ?? 0,
    failed: failedSummary?.total ?? 0,
    isLoading:
      isTotalLoading ||
      isSuccessLoading ||
      isProcessingLoading ||
      isFailedLoading,
  }
}
