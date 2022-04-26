package models

import (
	"gorm.io/datatypes"
	"time"
)

type User struct {
	ID          string         `gorm:"type:varchar(36);primary_key"`
	Username    string         `gorm:"type:varchar(20);not null"`
	Password    string         `gorm:"type:varchar(64);not null"`
	Attributes  datatypes.JSON `gorm:"not null"`
	Description string         `gorm:"type:varchar(512)"`
	Birthday    time.Time
	GroupID     string    `gorm:"type:varchar(36)"`
	BankID      string    `gorm:"type:varchar(36)"`
	IsActive    bool      `gorm:"not null;default:false"`
	IsLocked    bool      `gorm:"not null;default:true"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}