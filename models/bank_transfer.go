package models

import "time"

type BankTransfer struct {
	ID          int64     `gorm:"primary_key"`
	Description string    `gorm:"type:varchar(512);not null"`
	PayerID     string    `gorm:"type:varchar(36);not null"`
	PayeeID     string    `gorm:"type:varchar(36);not null"`
	IsActive    bool      `gorm:"not null;default:false"`
	IsLocked    bool      `gorm:"not null;default:true"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
