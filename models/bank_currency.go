package models

import "time"

type BankCurrency struct {
	ID          string    `gorm:"primary_key"`
	Name        string    `gorm:"type:varchar(64);not null"`
	Description string    `gorm:"type:varchar(512);not null"`
	DeveloperID string    `gorm:"type:varchar(36);not null"`
	Icon        string    `gorm:"not null"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
