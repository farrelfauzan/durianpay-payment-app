package entity

import "time"

type Payment struct {
	ID        string
	Merchant  string
	Amount    float64
	Status    string
	CreatedAt time.Time
}
