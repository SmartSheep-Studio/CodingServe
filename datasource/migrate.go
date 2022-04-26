package datasource

import "codingserve/models"

func Migrate() {
	GetConnection().AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.VerifyCode{},

		&models.OauthToken{},
		&models.OauthClient{},

		&models.BankAccount{},
		&models.BankCurrency{},
		&models.BankTransfer{},
	)
}
