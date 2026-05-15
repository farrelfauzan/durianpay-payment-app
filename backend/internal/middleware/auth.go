package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/durianpay/fullstack-boilerplate/internal/transport"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string
	Role   string
}

type claimsKey struct{}

func NewAuthMiddleware(secret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/dashboard/v1/auth/login" || r.URL.Path == "/dashboard/v1/auth/logout" {
				next.ServeHTTP(w, r)
				return
			}

			needsAuth := strings.HasPrefix(r.URL.Path, "/dashboard/v1/payments") ||
				r.URL.Path == "/dashboard/v1/auth/me"

			if !needsAuth {
				next.ServeHTTP(w, r)
				return
			}

			tokenString := extractToken(r)
			if tokenString == "" {
				transport.WriteAppError(w, entity.ErrorUnauthorized("missing authorization token"))
				return
			}
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, entity.ErrorUnauthorized("invalid authorization token")
				}
				return secret, nil
			})
			if err != nil || !token.Valid {
				transport.WriteAppError(w, entity.ErrorUnauthorized("invalid authorization token"))
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				transport.WriteAppError(w, entity.ErrorUnauthorized("invalid authorization token"))
				return
			}

			ctx := context.WithValue(r.Context(), claimsKey{}, Claims{
				UserID: stringValue(claims["sub"]),
				Role:   stringValue(claims["role"]),
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func ClaimsFromContext(ctx context.Context) (Claims, bool) {
	claims, ok := ctx.Value(claimsKey{}).(Claims)
	return claims, ok
}

func RequireRole(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := ClaimsFromContext(r.Context())
			if !ok {
				transport.WriteAppError(w, entity.ErrorUnauthorized("missing authorization"))
				return
			}
			if _, permitted := allowed[claims.Role]; !permitted {
				transport.WriteAppError(w, entity.NewError(entity.ErrorCodeForbidden, "insufficient permissions"))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func stringValue(value any) string {
	if value == nil {
		return ""
	}
	switch typed := value.(type) {
	case string:
		return typed
	default:
		return ""
	}
}

// extractToken reads the JWT from the cookie first, then falls back to the Authorization header.
func extractToken(r *http.Request) string {
	if cookie, err := r.Cookie("token"); err == nil && cookie.Value != "" {
		return cookie.Value
	}
	authorization := r.Header.Get("Authorization")
	const bearerPrefix = "Bearer "
	if strings.HasPrefix(authorization, bearerPrefix) {
		return strings.TrimSpace(strings.TrimPrefix(authorization, bearerPrefix))
	}
	return ""
}
