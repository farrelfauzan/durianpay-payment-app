package repository

import (
	"database/sql"
	"path/filepath"
	"testing"

	"github.com/durianpay/fullstack-boilerplate/internal/seed"
	_ "github.com/mattn/go-sqlite3"
)

func newTestPaymentDB(t *testing.T) *sql.DB {
	t.Helper()

	dbPath := filepath.Join(t.TempDir(), "payments.db")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	if err := seed.Init(db); err != nil {
		t.Fatalf("seed db: %v", err)
	}
	return db
}

func TestListReturnsPayments(t *testing.T) {
	db := newTestPaymentDB(t)
	defer db.Close()

	repo := NewPaymentRepo(db)
	result, err := repo.List(t.Context(), PaymentQueryParams{})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(result.Payments) != 10 {
		t.Fatalf("expected default page size of 10, got %d", len(result.Payments))
	}
	if result.Total != 50 {
		t.Fatalf("expected total 50 seeded payments, got %d", result.Total)
	}
	if result.Page != 1 || result.PageSize != 10 || result.Offset != 0 {
		t.Fatalf("unexpected pagination metadata: %#v", result)
	}
	if result.Payments[0].CreatedAt.Before(result.Payments[1].CreatedAt) {
		t.Fatal("expected default sort by newest first")
	}
}

func TestListFiltersByStatus(t *testing.T) {
	db := newTestPaymentDB(t)
	defer db.Close()

	repo := NewPaymentRepo(db)
	status := "completed"
	result, err := repo.List(t.Context(), PaymentQueryParams{Status: &status})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(result.Payments) == 0 {
		t.Fatal("expected some completed payments")
	}
	for _, payment := range result.Payments {
		if payment.Status != status {
			t.Fatalf("unexpected status: %s", payment.Status)
		}
	}
}

func TestListSupportsSearchAndPagination(t *testing.T) {
	db := newTestPaymentDB(t)
	defer db.Close()

	repo := NewPaymentRepo(db)
	search := "tokopedia"
	result, err := repo.List(t.Context(), PaymentQueryParams{Search: &search, Page: 2, PageSize: 5})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Page != 2 || result.PageSize != 5 || result.Offset != 5 {
		t.Fatalf("unexpected pagination metadata: %#v", result)
	}
	if result.Total == 0 {
		t.Fatal("expected non-zero total for search")
	}
	if len(result.Payments) == 0 {
		t.Fatal("expected non-empty result for search")
	}
	for _, payment := range result.Payments {
		if payment.ID == "" || payment.Merchant == "" {
			t.Fatalf("unexpected payment: %#v", payment)
		}
	}
}

func TestCountByStatus(t *testing.T) {
	db := newTestPaymentDB(t)
	defer db.Close()

	repo := NewPaymentRepo(db)
	counts, err := repo.CountByStatus(t.Context())
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if counts["completed"] == 0 && counts["processing"] == 0 && counts["failed"] == 0 {
		t.Fatal("expected status counts to be populated")
	}
}
