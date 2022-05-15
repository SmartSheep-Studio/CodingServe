package models

import (
	"time"

	"gorm.io/datatypes"
)

type BankAccount struct {
	ID           string         `gorm:"type:varchar(36);primary_key"`
	Name         string         `gorm:"type:varchar(128);not null"`
	Description  string         `gorm:"type:varchar(512);not null"`
	HasBalance   datatypes.JSON `gorm:"not null"`
	HasMaterials datatypes.JSON `gorm:"not null"`
	IsActive     bool           `gorm:"not null;default:false"`
	IsLocked     bool           `gorm:"not null;default:true"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime:milli"`
	CreatedAt    time.Time      `gorm:"autoCreateTime"`
}
