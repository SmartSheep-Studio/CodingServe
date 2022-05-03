package models

import (
	"gorm.io/datatypes"
	"time"
)

type User struct {
	ID              string         `gorm:"type:varchar(36);primary_key"`
	Username        string         `gorm:"uniqueIndex;type:varchar(20);not null" binding:"required"`
	Password        string         `gorm:"type:varchar(64);not null" binding:"required"`
	Email           string         `gorm:"uniqueIndex;type:varchar(128);not null" binding:"required"`
	Attributes      datatypes.JSON `gorm:"not null"`
	Permissions     datatypes.JSON `gorm:"not null"`
	Description     string         `gorm:"type:varchar(512)"`
	Birthday        time.Time      `gorm:"autoCreateTime"`
	Level           int64          `gorm:"default:1"`
	LevelExperience int64          `gorm:"default:0"`
	GroupID         string         `gorm:"type:varchar(36)"`
	BankID          string         `gorm:"type:varchar(36)"`
	IsActive        bool           `gorm:"not null;default:false"`
	IsLocked        bool           `gorm:"not null;default:false"`
	LockedID        string         `gorm:""`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime:milli"`
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
}
