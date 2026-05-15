package usecase

import (
	"context"
	"strings"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	repository "github.com/durianpay/fullstack-boilerplate/internal/module/payment/repository"
)

type PaymentUsecase interface {
	List(ctx context.Context, params repository.PaymentQueryParams) (repository.PaymentListResult, error)
}

type Payment struct {
	repo repository.PaymentRepository
}

func NewPaymentUsecase(repo repository.PaymentRepository) *Payment {
	return &Payment{repo: repo}
}

func (p *Payment) List(ctx context.Context, params repository.PaymentQueryParams) (repository.PaymentListResult, error) {
	if params.Status != nil {
		status := strings.TrimSpace(*params.Status)
		if status != "" && !isAllowedStatus(status) {
			return repository.PaymentListResult{}, entity.ErrorBadRequest("invalid payment status")
		}
	}

	if params.Page < 0 {
		return repository.PaymentListResult{}, entity.ErrorBadRequest("page must be greater than or equal to 1")
	}

	if params.Page == 0 {
		params.Page = 1
	}

	if params.PageSize < 0 {
		return repository.PaymentListResult{}, entity.ErrorBadRequest("page_size must be greater than or equal to 1")
	}

	if params.PageSize == 0 {
		params.PageSize = 10
	}

	if params.PageSize > 100 {
		return repository.PaymentListResult{}, entity.ErrorBadRequest("page_size must be less than or equal to 100")
	}

	if params.Search != nil {
		search := strings.TrimSpace(*params.Search)
		if search == "" {
			params.Search = nil
		} else {
			params.Search = &search
		}
	}

	return p.repo.List(ctx, params)
}

func isAllowedStatus(status string) bool {
	switch status {
	case "completed", "processing", "failed":
		return true
	default:
		return false
	}
}
