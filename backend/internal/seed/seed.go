package seed

import (
	"database/sql"
	"fmt"
	"math/rand"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func Init(db *sql.DB) error {
	if err := ensureSchema(db); err != nil {
		return err
	}
	if err := seedUsers(db); err != nil {
		return err
	}
	if err := seedPayments(db); err != nil {
		return err
	}
	return nil
}

func ensureSchema(db *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS users (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  email TEXT NOT NULL UNIQUE,
		  password_hash TEXT NOT NULL,
		  role TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS payments (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  merchant TEXT NOT NULL,
		  amount REAL NOT NULL,
		  status TEXT NOT NULL,
		  created_at TEXT NOT NULL
		);`,
	}

	for _, stmt := range stmts {
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}
	return nil
}

func seedUsers(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`SELECT COUNT(1) FROM users`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	users := []struct {
		email string
		role  string
	}{
		{email: "cs@test.com", role: "cs"},
		{email: "operation@test.com", role: "operation"},
	}

	for _, user := range users {
		if _, err := db.Exec(`INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)`, user.email, string(hash), user.role); err != nil {
			return err
		}
	}

	return nil
}

func seedPayments(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`SELECT COUNT(1) FROM payments`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	rng := rand.New(rand.NewSource(42))
	merchants := []string{"Tokopedia", "Shopee", "Gojek", "Traveloka", "Blibli", "Bukalapak"}
	statuses := []string{"completed", "processing", "failed"}
	baseTime := time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC)

	for i := 1; i <= 50; i++ {
		merchant := merchants[rng.Intn(len(merchants))]
		status := statuses[rng.Intn(len(statuses))]
		amount := 50000 + rng.Intn(450000)
		createdAt := baseTime.Add(time.Duration(i) * time.Hour)

		if _, err := db.Exec(
			`INSERT INTO payments(merchant, amount, status, created_at) VALUES (?, ?, ?, ?)`,
			merchant,
			fmt.Sprintf("%.2f", float64(amount)),
			status,
			createdAt.Format(time.RFC3339),
		); err != nil {
			return err
		}
	}

	return nil
}
