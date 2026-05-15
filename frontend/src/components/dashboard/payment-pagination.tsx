import { cn } from '#/lib/utils'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination'

type PageToken = number | 'ellipsis-left' | 'ellipsis-right'

function buildPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const tokens: PageToken[] = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    tokens.push('ellipsis-left')
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(page)
  }

  if (end < totalPages - 1) {
    tokens.push('ellipsis-right')
  }

  tokens.push(totalPages)

  return tokens
}

interface PaymentPaginationProps {
  currentPage: number
  totalPages: number
  startItem: number
  endItem: number
  total: number
  nextPage: number | null
  previousPage: number | null
  isLoading: boolean
  isFetching: boolean
  onPageChange: (page: number) => void
}

export function PaymentPagination({
  currentPage,
  totalPages,
  startItem,
  endItem,
  total,
  nextPage,
  previousPage,
  isLoading,
  isFetching,
  onPageChange,
}: PaymentPaginationProps) {
  const pageTokens = buildPageTokens(currentPage, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-slate-300/70 bg-white/30 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/25 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-muted-foreground md:whitespace-nowrap">
        {isLoading ? (
          <Skeleton className="h-4 w-44 bg-slate-300/60 dark:bg-slate-700/70" />
        ) : (
          <>
            Showing {startItem}-{endItem} of{' '}
            <span className="whitespace-nowrap">{total} payments</span>
            {isFetching && !isLoading ? ' (updating...)' : ''}
          </>
        )}
      </div>
      <Pagination className="w-full justify-center md:ml-auto md:mx-0 md:w-auto md:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={cn(
                !previousPage && 'pointer-events-none opacity-50',
              )}
              onClick={(event) => {
                event.preventDefault()
                if (previousPage) {
                  onPageChange(previousPage)
                }
              }}
            />
          </PaginationItem>

          {pageTokens.map((token) => {
            if (typeof token !== 'number') {
              return (
                <PaginationItem key={token}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            return (
              <PaginationItem key={token}>
                <PaginationLink
                  href="#"
                  isActive={token === currentPage}
                  onClick={(event) => {
                    event.preventDefault()
                    onPageChange(token)
                  }}
                >
                  {token}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              className={cn(
                !nextPage && 'pointer-events-none opacity-50',
              )}
              onClick={(event) => {
                event.preventDefault()
                if (nextPage) {
                  onPageChange(nextPage)
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
