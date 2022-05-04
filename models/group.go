package models

import (
	"time"

	"gorm.io/datatypes"
)

type Group struct {
	ID          string         `gorm:"type:varchar(36);primary_key"`
	Name        string         `gorm:"type:varchar(32);not null" binding:"required"`
	Description string         `gorm:"type:varchar(512)"`
	Permissions datatypes.JSON `gorm:"not null" binding:"required"`
	IsActive    bool           `gorm:"not null;default:true"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time      `gorm:"autoCreateTime"`
}
