package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type fakeUserRepo struct {
	user *entity.User
	err  error
}

func (f fakeUserRepo) GetUserByEmail(email string) (*entity.User, error) {
	return f.user, f.err
}

func (f fakeUserRepo) GetUserByID(id string) (*entity.User, error) {
	return f.user, f.err
}

func TestLoginSuccess(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}

	userRepo := fakeUserRepo{user: &entity.User{ID: "1", Email: "cs@test.com", PasswordHash: string(hash), Role: "cs"}}
	service := NewAuthUsecase(userRepo, []byte("secret"), time.Hour)

	token, user, err := service.Login("cs@test.com", "password")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if token == "" {
		t.Fatal("expected token to be generated")
	}
	if user == nil || user.Email != "cs@test.com" {
		t.Fatalf("unexpected user: %#v", user)
	}

	parsed, err := jwt.Parse(token, func(token *jwt.Token) (any, error) {
		return []byte("secret"), nil
	})
	if err != nil || !parsed.Valid {
		t.Fatalf("token should be valid, err=%v", err)
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}

	userRepo := fakeUserRepo{user: &entity.User{ID: "1", Email: "cs@test.com", PasswordHash: string(hash), Role: "cs"}}
	service := NewAuthUsecase(userRepo, []byte("secret"), time.Hour)

	_, _, err = service.Login("cs@test.com", "wrong-password")
	if err == nil {
		t.Fatal("expected error")
	}
	var appErr *entity.AppError
	if !errors.As(err, &appErr) || appErr.Code != entity.ErrorCodeUnauthorized {
		t.Fatalf("expected unauthorized app error, got %#v", err)
	}
}

func TestLoginUnknownUserReturnsUnauthorized(t *testing.T) {
	userRepo := fakeUserRepo{err: entity.ErrorNotFound("user not found")}
	service := NewAuthUsecase(userRepo, []byte("secret"), time.Hour)

	_, _, err := service.Login("missing@test.com", "password")
	if err == nil {
		t.Fatal("expected error")
	}
	var appErr *entity.AppError
	if !errors.As(err, &appErr) || appErr.Code != entity.ErrorCodeUnauthorized {
		t.Fatalf("expected unauthorized app error, got %#v", err)
	}
}
