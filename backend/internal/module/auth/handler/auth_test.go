package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/durianpay/fullstack-boilerplate/internal/openapigen"
)

type fakeAuthUsecase struct {
	token string
	user  *entity.User
	err   error
}

func (f fakeAuthUsecase) Login(email string, password string) (string, *entity.User, error) {
	return f.token, f.user, f.err
}

func (f fakeAuthUsecase) GetMe(userID string) (*entity.User, error) {
	return f.user, f.err
}

func TestPostDashboardV1AuthLoginSuccess(t *testing.T) {
	handler := NewAuthHandler(fakeAuthUsecase{
		token: "jwt-token",
		user:  &entity.User{Email: "cs@test.com", Role: "cs"},
	}, time.Hour)

	body, _ := json.Marshal(openapigen.PostDashboardV1AuthLoginJSONBody{Email: "cs@test.com", Password: "password"})
	req := httptest.NewRequest(http.MethodPost, "/dashboard/v1/auth/login", bytes.NewReader(body))
	rec := httptest.NewRecorder()

	handler.PostDashboardV1AuthLogin(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	var response openapigen.LoginResponse
	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if response.Token == nil || *response.Token != "jwt-token" {
		t.Fatalf("unexpected token: %#v", response.Token)
	}
	if response.Email == nil || *response.Email != "cs@test.com" {
		t.Fatalf("unexpected email: %#v", response.Email)
	}
	if response.Role == nil || *response.Role != "cs" {
		t.Fatalf("unexpected role: %#v", response.Role)
	}
}

func TestPostDashboardV1AuthLoginError(t *testing.T) {
	handler := NewAuthHandler(fakeAuthUsecase{err: entity.ErrorUnauthorized("invalid credentials")}, time.Hour)
	body, _ := json.Marshal(openapigen.PostDashboardV1AuthLoginJSONBody{Email: "cs@test.com", Password: "bad"})
	req := httptest.NewRequest(http.MethodPost, "/dashboard/v1/auth/login", bytes.NewReader(body))
	rec := httptest.NewRecorder()

	handler.PostDashboardV1AuthLogin(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
	var response map[string]any
	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if response["code"] == nil {
		t.Fatal("expected error code in response")
	}
}

func TestPostDashboardV1AuthLoginInvalidBody(t *testing.T) {
	handler := NewAuthHandler(fakeAuthUsecase{}, time.Hour)
	req := httptest.NewRequest(http.MethodPost, "/dashboard/v1/auth/login", bytes.NewBufferString("{"))
	rec := httptest.NewRecorder()

	handler.PostDashboardV1AuthLogin(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
	if !errors.Is(nil, nil) {
		// keep package errors import used by lint and compiler in case of future tweaks
	}
}
