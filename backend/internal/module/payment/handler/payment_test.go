package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/durianpay/fullstack-boilerplate/internal/module/payment/repository"
	"github.com/durianpay/fullstack-boilerplate/internal/openapigen"
)

type fakePaymentUsecase struct {
	result repository.PaymentListResult
	err    error
}

func (f fakePaymentUsecase) List(ctx context.Context, params repository.PaymentQueryParams) (repository.PaymentListResult, error) {
	return f.result, f.err
}

func TestGetDashboardV1PaymentsSuccess(t *testing.T) {
	handler := NewPaymentHandler(fakePaymentUsecase{
		result: repository.PaymentListResult{
			Payments: []entity.Payment{{ID: "1", Merchant: "Tokopedia", Amount: 150000, Status: "completed", CreatedAt: time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC)}},
			Page:     1,
			PageSize: 10,
			Total:    1,
			Offset:   0,
		},
	})

	req := httptest.NewRequest(http.MethodGet, "/dashboard/v1/payments", bytes.NewReader(nil))
	rec := httptest.NewRecorder()

	handler.GetDashboardV1Payments(rec, req, openapigen.GetDashboardV1PaymentsParams{})

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var response openapigen.PaymentListResponse
	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(response.Payments) != 1 {
		t.Fatalf("unexpected response: %#v", response)
	}
	if response.Payments[0].Merchant == nil || *response.Payments[0].Merchant != "Tokopedia" {
		t.Fatalf("unexpected merchant: %#v", response.Payments[0].Merchant)
	}
	if response.Page != 1 || response.PageSize != 10 || response.Total != 1 || response.Offset != 0 {
		t.Fatalf("unexpected pagination response: %#v", response)
	}
}
