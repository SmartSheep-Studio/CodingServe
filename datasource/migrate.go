package datasource

import "codingserve/models"

func Migrate() error {
	err := GetConnection().AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.VerifyCode{},

		&models.OauthToken{},
		&models.OauthClient{},

		&models.BankAccount{},
		&models.BankCurrency{},
		&models.BankTransfer{},
	)
	return err
}
