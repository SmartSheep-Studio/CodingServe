package models

import "time"

type BankMaterial struct {
	ID          string    `gorm:"primary_key"`
	Name        string    `gorm:"type:varchar(128);not null"`
	Description string    `gorm:"type:varchar(512);not null"`
	Icon        string    `gorm:"not null"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
