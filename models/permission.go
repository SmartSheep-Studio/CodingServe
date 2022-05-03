package models

import "time"

type Permission struct {
	ID          uint      `gorm:"primaryKey"`
	Permission  string    `gorm:"uniqueIndex;type:varchar(128);not null"`
	Description string    `gorm:"type:varchar(256);not null"`
	IsDefault   bool      `gorm:"default:false"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
