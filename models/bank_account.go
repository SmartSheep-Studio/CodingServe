package models

import (
	"gorm.io/datatypes"
	"time"
)

type BankAccount struct {
	ID        string         `gorm:"type:varchar(36);primary_key"`
	Password  string         `gorm:"type:varchar(64);not null"`
	Currency  datatypes.JSON `gorm:"not null"`
	IsActive  bool           `gorm:"not null;default:false"`
	IsLocked  bool           `gorm:"not null;default:true"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime:milli"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
}
