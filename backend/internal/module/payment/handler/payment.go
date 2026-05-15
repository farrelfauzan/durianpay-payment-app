package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/durianpay/fullstack-boilerplate/internal/module/payment/repository"
	paymentUsecase "github.com/durianpay/fullstack-boilerplate/internal/module/payment/usecase"
	"github.com/durianpay/fullstack-boilerplate/internal/openapigen"
	"github.com/durianpay/fullstack-boilerplate/internal/transport"
)

type PaymentHandler struct {
	paymentUC paymentUsecase.PaymentUsecase
}

func NewPaymentHandler(paymentUC paymentUsecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{paymentUC: paymentUC}
}

func (h *PaymentHandler) GetDashboardV1Payments(w http.ResponseWriter, r *http.Request, params openapigen.GetDashboardV1PaymentsParams) {
	query := repository.PaymentQueryParams{Status: params.Status, ID: params.Id}
	if params.Sort != nil {
		sort := string(*params.Sort)
		query.Sort = &sort
	}
	if params.Search != nil {
		search := string(*params.Search)
		query.Search = &search
	}
	if params.Page != nil {
		query.Page = int(*params.Page)
	}
	if params.PageSize != nil {
		query.PageSize = int(*params.PageSize)
	}

	result, err := h.paymentUC.List(r.Context(), query)
	if err != nil {
		transport.WriteError(w, err)
		return
	}

	responsePayments := make([]openapigen.Payment, 0, len(result.Payments))
	for _, payment := range result.Payments {
		id := payment.ID
		merchant := payment.Merchant
		status := payment.Status
		amount := fmt.Sprintf("%.2f", payment.Amount)
		createdAt := payment.CreatedAt.UTC()
		responsePayments = append(responsePayments, openapigen.Payment{
			Id:        &id,
			Merchant:  &merchant,
			Status:    &status,
			Amount:    &amount,
			CreatedAt: &createdAt,
		})
	}

	payload := openapigen.PaymentListResponse{
		Payments:     responsePayments,
		Page:         result.Page,
		PageSize:     result.PageSize,
		Total:        result.Total,
		Offset:       result.Offset,
		NextPage:     result.NextPage,
		PreviousPage: result.PreviousPage,
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		transport.WriteError(w, err)
	}
}
