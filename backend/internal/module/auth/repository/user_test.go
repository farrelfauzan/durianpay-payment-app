package repository

import (
	"database/sql"
	"path/filepath"
	"testing"

	"golang.org/x/crypto/bcrypt"

	_ "github.com/mattn/go-sqlite3"
)

func newTestUserDB(t *testing.T) *sql.DB {
	t.Helper()

	dbPath := filepath.Join(t.TempDir(), "users.db")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}

	if _, err := db.Exec(`CREATE TABLE users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		role TEXT NOT NULL
	)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}

	if _, err := db.Exec(`INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)`, "cs@test.com", string(hash), "cs"); err != nil {
		t.Fatalf("insert user: %v", err)
	}

	return db
}

func TestGetUserByEmailFound(t *testing.T) {
	db := newTestUserDB(t)
	defer db.Close()

	repo := NewUserRepo(db)
	user, err := repo.GetUserByEmail("cs@test.com")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if user.Email != "cs@test.com" || user.Role != "cs" {
		t.Fatalf("unexpected user: %#v", user)
	}
}

func TestGetUserByEmailNotFound(t *testing.T) {
	db := newTestUserDB(t)
	defer db.Close()

	repo := NewUserRepo(db)
	_, err := repo.GetUserByEmail("missing@test.com")
	if err == nil {
		t.Fatal("expected error")
	}
}
