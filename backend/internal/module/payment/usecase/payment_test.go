package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	repository "github.com/durianpay/fullstack-boilerplate/internal/module/payment/repository"
)

type fakePaymentRepo struct {
	result repository.PaymentListResult
	err    error
}

func (f fakePaymentRepo) List(ctx context.Context, params repository.PaymentQueryParams) (repository.PaymentListResult, error) {
	return f.result, f.err
}

func (f fakePaymentRepo) CountByStatus(ctx context.Context) (map[string]int, error) {
	return map[string]int{}, nil
}

func TestListRejectsInvalidStatus(t *testing.T) {
	status := "invalid"
	service := NewPaymentUsecase(fakePaymentRepo{})
	_, err := service.List(context.Background(), repository.PaymentQueryParams{Status: &status})
	if err == nil {
		t.Fatal("expected error")
	}
	var appErr *entity.AppError
	if !errors.As(err, &appErr) || appErr.Code != entity.ErrorCodeBadRequest {
		t.Fatalf("expected bad request app error, got %#v", err)
	}
}

func TestListPassesThroughValidStatus(t *testing.T) {
	status := "completed"
	payments := []entity.Payment{{ID: "1", Merchant: "Tokopedia", Status: "completed"}}
	service := NewPaymentUsecase(fakePaymentRepo{result: repository.PaymentListResult{Payments: payments}})
	result, err := service.List(context.Background(), repository.PaymentQueryParams{Status: &status})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(result.Payments) != 1 || result.Payments[0].Merchant != "Tokopedia" {
		t.Fatalf("unexpected result: %#v", result)
	}
}

func TestListRejectsInvalidPageSize(t *testing.T) {
	service := NewPaymentUsecase(fakePaymentRepo{})
	_, err := service.List(context.Background(), repository.PaymentQueryParams{PageSize: 101})
	if err == nil {
		t.Fatal("expected error")
	}
	var appErr *entity.AppError
	if !errors.As(err, &appErr) || appErr.Code != entity.ErrorCodeBadRequest {
		t.Fatalf("expected bad request app error, got %#v", err)
	}
}
