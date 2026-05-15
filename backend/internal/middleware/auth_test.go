package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func newToken(t *testing.T, secret []byte) string {
	t.Helper()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  "1",
		"role": "cs",
		"exp":  time.Now().Add(time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	})
	signed, err := token.SignedString(secret)
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return signed
}

func TestAuthMiddlewareAllowsValidPaymentsRequest(t *testing.T) {
	mw := NewAuthMiddleware([]byte("secret"))
	nextCalled := false
	next := mw(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/dashboard/v1/payments", nil)
	req.Header.Set("Authorization", "Bearer "+newToken(t, []byte("secret")))
	rec := httptest.NewRecorder()

	next.ServeHTTP(rec, req)

	if !nextCalled {
		t.Fatal("expected middleware to pass request through")
	}
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestAuthMiddlewareRejectsMissingToken(t *testing.T) {
	mw := NewAuthMiddleware([]byte("secret"))
	next := mw(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/dashboard/v1/payments", nil)
	rec := httptest.NewRecorder()

	next.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}

func TestRequireRoleAllowsPermittedRole(t *testing.T) {
	mw := NewAuthMiddleware([]byte("secret"))
	roleMw := RequireRole("cs", "operation")

	nextCalled := false
	handler := mw(roleMw(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})))

	req := httptest.NewRequest(http.MethodGet, "/dashboard/v1/payments", nil)
	req.Header.Set("Authorization", "Bearer "+newToken(t, []byte("secret"))) // role=cs
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if !nextCalled {
		t.Fatal("expected handler to be called for permitted role")
	}
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestRequireRoleRejectsForbiddenRole(t *testing.T) {
	mw := NewAuthMiddleware([]byte("secret"))
	roleMw := RequireRole("operation") // only operation allowed

	nextCalled := false
	handler := mw(roleMw(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
	})))

	req := httptest.NewRequest(http.MethodGet, "/dashboard/v1/payments", nil)
	req.Header.Set("Authorization", "Bearer "+newToken(t, []byte("secret"))) // role=cs
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if nextCalled {
		t.Fatal("expected handler NOT to be called for forbidden role")
	}
	if rec.Code != http.StatusForbidden {
		t.Fatalf("expected 403, got %d", rec.Code)
	}
}

func TestRequireRoleRejectsNoContext(t *testing.T) {
	roleMw := RequireRole("operation")

	handler := roleMw(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("should not be called")
	}))

	req := httptest.NewRequest(http.MethodGet, "/dashboard/v1/payments", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}
