package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/durianpay/fullstack-boilerplate/internal/middleware"
	authUsecase "github.com/durianpay/fullstack-boilerplate/internal/module/auth/usecase"
	"github.com/durianpay/fullstack-boilerplate/internal/openapigen"
	"github.com/durianpay/fullstack-boilerplate/internal/transport"
)

const cookieName = "token"

type AuthHandler struct {
	authUC    authUsecase.AuthUsecase
	cookieTTL time.Duration
}

func NewAuthHandler(authUC authUsecase.AuthUsecase, cookieTTL time.Duration) *AuthHandler {
	return &AuthHandler{
		authUC:    authUC,
		cookieTTL: cookieTTL,
	}
}

func (a *AuthHandler) PostDashboardV1AuthLogin(w http.ResponseWriter, r *http.Request) {
	var req openapigen.PostDashboardV1AuthLoginJSONBody
	if !decodeJSONBody(w, r, &req) {
		return
	}
	token, user, err := a.authUC.Login(req.Email, req.Password)
	if err != nil {
		transport.WriteError(w, err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   r.TLS != nil,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(a.cookieTTL.Seconds()),
	})

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(openapigen.LoginResponse{Email: &user.Email, Role: &user.Role, Token: &token})
	if err != nil {
		transport.WriteAppError(w, entity.ErrorInternal("internal server error"))
		return
	}
}

func (a *AuthHandler) GetDashboardV1AuthMe(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		transport.WriteAppError(w, entity.ErrorUnauthorized("unauthorized"))
		return
	}

	user, err := a.authUC.GetMe(claims.UserID)
	if err != nil {
		transport.WriteError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(openapigen.User{Email: &user.Email, Role: &user.Role})
	if err != nil {
		transport.WriteAppError(w, entity.ErrorInternal("internal server error"))
		return
	}
}

func (a *AuthHandler) PostDashboardV1AuthLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   r.TLS != nil,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
	w.WriteHeader(http.StatusNoContent)
}

func decodeJSONBody(w http.ResponseWriter, r *http.Request, dst any) bool {
	if r.Body == nil {
		transport.WriteAppError(w, entity.ErrorBadRequest("empty body"))
		return false
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		transport.WriteAppError(w, entity.ErrorBadRequest("failed to read body"))
		return false
	}

	if err := json.Unmarshal(body, dst); err != nil {
		transport.WriteAppError(w, entity.ErrorBadRequest("invalid json: "+err.Error()))
		return false
	}
	return true
}
