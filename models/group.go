package models

import "time"

type Group struct {
	ID          string    `gorm:"type:varchar(36);primary_key"`
	Name        string    `gorm:"type:varchar(32);not null"`
	Description string    `gorm:"type:varchar(512)"`
	Permissions string    `gorm:""`
	IsActive    bool      `gorm:"not null;default:true"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
