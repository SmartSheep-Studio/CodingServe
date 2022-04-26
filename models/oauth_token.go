package models

import "time"

type OauthToken struct {
	ID        int64     `gorm:"primary_key"`
	UID       string    `gorm:"type:varchar(36);not null"`
	Code      string    `gorm:"type:varchar(36);not null"`
	Type      string    `gorm:"type:varchar(12);not null"` // Available Types is 'access' 'refresh'
	UpdatedAt time.Time `gorm:"autoUpdateTime:milli"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}
