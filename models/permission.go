package models

type Permission struct {
	ID         uint   `gorm:"primaryKey"`
	Permission string `gorm:"type:varchar(128);not null"`
	Object     string `gorm:"type:varchar(128);not null"`
}
