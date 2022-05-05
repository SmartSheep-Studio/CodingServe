package models

import "time"

type OauthClient struct {
	ID           string    `gorm:"primary_key"`
	Description  string    `gorm:"type:varchar(512);not null"`
	ClientID     string    `gorm:"type:varchar(36);not null"`
	ClientSercet string    `gorm:"type:varchar(36);not null"`
	ClientName   string    `gorm:"type:varchar(50);not null"`
	DeveloperID  string    `gorm:"type:varchar(36);not null"`
	Scope        string    `gorm:"not null"`
	Icon         string    `gorm:"not null"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
}
