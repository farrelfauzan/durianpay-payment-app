package usecase

import (
	"errors"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/durianpay/fullstack-boilerplate/internal/module/auth/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase interface {
	Login(email string, password string) (string, *entity.User, error)
	GetMe(userID string) (*entity.User, error)
}

type Auth struct {
	repo      repository.UserRepository
	jwtSecret []byte
	ttl       time.Duration
}

func NewAuthUsecase(repo repository.UserRepository, jwtSecret []byte, ttl time.Duration) *Auth {
	return &Auth{repo: repo, jwtSecret: jwtSecret, ttl: ttl}
}

// Login verifies email + password and returns a JWT.
func (a *Auth) Login(email string, password string) (string, *entity.User, error) {
	user, err := a.repo.GetUserByEmail(email)
	if err != nil {
		var appErr *entity.AppError
		if errors.As(err, &appErr) && appErr.Code == entity.ErrorCodeNotFound {
			return "", nil, entity.ErrorUnauthorized("invalid credentials")
		}
		return "", nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", nil, entity.ErrorUnauthorized("invalid credentials")
	}

	claims := jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(a.ttl).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(a.jwtSecret)
	if err != nil {
		return "", nil, entity.WrapError(err, entity.ErrorCodeInternal, "failed to sign token")
	}
	return signed, user, nil
}

// GetMe retrieves the current user by ID.
func (a *Auth) GetMe(userID string) (*entity.User, error) {
	user, err := a.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	return user, nil
}
