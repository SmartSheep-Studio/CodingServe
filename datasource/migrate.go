package datasource

import (
	"codingserve/models"
	"fmt"

	"gorm.io/datatypes"
)

func Migrate() error {
	err := GetConnection().AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.VerifyCode{},
		&models.ResourcesLock{},
		&models.Permission{},

		&models.OauthToken{},
		&models.OauthClient{},

		&models.BankAccount{},
		&models.BankCurrency{},
		&models.BankTransfer{},
	)
	if err == nil {
		MigrateData()
	}
	return err
}

func MigrateData() {
	fmt.Println("[MIGRATE] Start migrating default data...")

	// Init Permissions
	permissions := []*models.Permission{
		{Permission: "write:oauth", Description: "Create/Update oauth applications"},
		{Permission: "write:users", Description: "Create/Update users"},
		{Permission: "write:groups", Description: "Create/Update groups"},

		{Permission: "write:locks", Description: "Create/Update resource locks"},
		{Permission: "lock:oauth", Description: "Create/Update oauth clients resource locks"},
		{Permission: "lock:users", Description: "Create/Update users resource locks"},
	}
	for _, permission := range permissions {
		if err := GetConnection().Create(&permission).Error; err != nil {
			continue
		}
	}

	// Init groups
	groups := []*models.Group{
		{ID: "superadmin", Permissions: datatypes.JSON([]byte(`["*"]`)), Description: "SuperAdmin is the site maintainer and have all the permissions of the CodingLand"},
		{ID: "admin", Permissions: datatypes.JSON([]byte(`["write:oauth", "write:locks", "lock:oauth"]`)), Description: "Admin is the help maintainer of the CodingLand"},
		{ID: "developer", Permissions: datatypes.JSON([]byte(`["write:oauth"]`)), Description: "Developer is the CodingLand's content creator"},
	}
	for _, group := range groups {
		if err := GetConnection().Create(&group).Error; err != nil {
			continue
		}
	}

	fmt.Println("[MIGRATE] Migrating default data... Completed!")
}
