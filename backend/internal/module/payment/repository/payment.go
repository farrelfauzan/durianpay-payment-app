package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
)

type PaymentQueryParams struct {
	Status   *string
	ID       *string
	Sort     *string
	Search   *string
	Page     int
	PageSize int
}

type PaymentListResult struct {
	Payments     []entity.Payment
	Page         int
	PageSize     int
	Total        int
	Offset       int
	NextPage     *int
	PreviousPage *int
}

type PaymentRepository interface {
	List(ctx context.Context, params PaymentQueryParams) (PaymentListResult, error)
	CountByStatus(ctx context.Context) (map[string]int, error)
}

type Payment struct {
	db *sql.DB
}

func NewPaymentRepo(db *sql.DB) *Payment {
	return &Payment{db: db}
}

func (r *Payment) List(ctx context.Context, params PaymentQueryParams) (PaymentListResult, error) {
	page := params.Page
	if page < 1 {
		page = 1
	}

	pageSize := params.PageSize
	if pageSize < 1 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var (
		clauses []string
		args    []any
	)

	if params.ID != nil && strings.TrimSpace(*params.ID) != "" {
		clauses = append(clauses, "id = ?")
		args = append(args, strings.TrimSpace(*params.ID))
	}

	if params.Status != nil && strings.TrimSpace(*params.Status) != "" {
		clauses = append(clauses, "status = ?")
		args = append(args, strings.TrimSpace(*params.Status))
	}

	if params.Search != nil && strings.TrimSpace(*params.Search) != "" {
		search := "%" + strings.ToLower(strings.TrimSpace(*params.Search)) + "%"
		clauses = append(clauses, "(LOWER(id) LIKE ? OR LOWER(merchant) LIKE ? OR LOWER(status) LIKE ?)")
		args = append(args, search, search, search)
	}

	whereClause := ""
	if len(clauses) > 0 {
		whereClause = " WHERE " + strings.Join(clauses, " AND ")
	}

	countQuery := "SELECT COUNT(1) FROM payments" + whereClause
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return PaymentListResult{}, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}

	query := strings.Builder{}
	query.WriteString("SELECT id, merchant, amount, status, created_at FROM payments")
	query.WriteString(whereClause)
	query.WriteString(" ORDER BY ")
	query.WriteString(orderByClause(params.Sort))
	query.WriteString(" LIMIT ? OFFSET ?")

	queryArgs := append(append([]any{}, args...), pageSize, offset)

	rows, err := r.db.QueryContext(ctx, query.String(), queryArgs...)
	if err != nil {
		return PaymentListResult{}, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}
	defer rows.Close()

	payments := make([]entity.Payment, 0)
	for rows.Next() {
		var (
			payment   entity.Payment
			createdAt string
		)
		if err := rows.Scan(&payment.ID, &payment.Merchant, &payment.Amount, &payment.Status, &createdAt); err != nil {
			return PaymentListResult{}, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
		}
		parsedTime, err := parseTime(createdAt)
		if err != nil {
			return PaymentListResult{}, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
		}
		payment.CreatedAt = parsedTime
		payments = append(payments, payment)
	}

	if err := rows.Err(); err != nil {
		return PaymentListResult{}, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}

	var nextPage *int
	if offset+len(payments) < total {
		next := page + 1
		nextPage = &next
	}

	var previousPage *int
	if page > 1 {
		prev := page - 1
		previousPage = &prev
	}

	return PaymentListResult{
		Payments:     payments,
		Page:         page,
		PageSize:     pageSize,
		Total:        total,
		Offset:       offset,
		NextPage:     nextPage,
		PreviousPage: previousPage,
	}, nil
}

func (r *Payment) CountByStatus(ctx context.Context) (map[string]int, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT status, COUNT(1) FROM payments GROUP BY status`)
	if err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}
	defer rows.Close()

	counts := map[string]int{}
	for rows.Next() {
		var status string
		var total int
		if err := rows.Scan(&status, &total); err != nil {
			return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
		}
		counts[status] = total
	}

	if err := rows.Err(); err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}

	return counts, nil
}

func orderByClause(sort *string) string {
	if sort == nil || strings.TrimSpace(*sort) == "" {
		return "datetime(created_at) DESC"
	}

	value := strings.TrimSpace(*sort)
	direction := "ASC"
	if strings.HasPrefix(value, "-") {
		direction = "DESC"
		value = strings.TrimPrefix(value, "-")
	}

	allowed := map[string]string{
		"id":         "id",
		"merchant":   "merchant",
		"amount":     "amount",
		"status":     "status",
		"created_at": "datetime(created_at)",
	}

	column, ok := allowed[value]
	if !ok {
		return "datetime(created_at) DESC"
	}

	return fmt.Sprintf("%s %s", column, direction)
}

func parseTime(value string) (time.Time, error) {
	if parsed, err := time.Parse(time.RFC3339Nano, value); err == nil {
		return parsed, nil
	}
	return time.Parse(time.RFC3339, value)
}
