package models

import "time"

type BankCurrency struct {
	ID          int64     `gorm:"primary_key"`
	Description string    `gorm:"type:varchar(512);not null"`
	CurrencyID  string    `gorm:"type:varchar(3);not null"`
	DeveloperID string    `gorm:"type:varchar(36);not null"`
	Icon        string    `gorm:"not null"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
