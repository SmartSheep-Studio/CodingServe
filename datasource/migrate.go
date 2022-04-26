package datasource

import "codingserve/models"

func Migrate() {
	GetConnection().AutoMigrate(
		&models.User{},
	)
}
