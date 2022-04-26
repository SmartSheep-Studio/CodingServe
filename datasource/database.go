package datasource

import (
	"codingserve/configs"
	"strings"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var connection *gorm.DB

func GetConnection() *gorm.DB {
	return connection
}

func init() {
	uri := strings.Join([]string{
		configs.SysConfig.DataBase.UserName,
		":",
		configs.SysConfig.DataBase.Password,
		"@tcp(",
		configs.SysConfig.DataBase.Host,
		")/",
		configs.SysConfig.DataBase.BaseName,
		"?charset=utf8mb4&",
		"parseTime=True&",
		"loc=Local",
	}, "")

	var err error

	connection, err = gorm.Open(mysql.Open(uri), &gorm.Config{})
	if err != nil {
		panic(err)
	}
}
