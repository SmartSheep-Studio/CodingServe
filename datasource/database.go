package datasource

import (
	"codingserve/configs"
	"log"
	"os"
	"strings"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
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

	connection, err = gorm.Open(mysql.Open(uri), &gorm.Config{
		Logger: logger.New(log.New(os.Stdout, "\r\n", log.LstdFlags), logger.Config{
			IgnoreRecordNotFoundError: true,
		}),
	})
	if err != nil {
		panic(err)
	}
}
