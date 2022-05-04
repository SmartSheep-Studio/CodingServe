package models

import "time"

type ResourcesLock struct {
	ID          string    `gorm:"primaryKey;type:varchar(36)"`
	Status      string    `gorm:"type:varchar(12);not null;default:'processing'"` // Available status is "processing" "closed" "locked"
	Description string    `gorm:"not null"`
	AgreeCount  uint      `gorm:"default:0"`
	IssuerID    string    `gorm:"not null;type:varchar(36)"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
