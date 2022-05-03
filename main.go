package main

import (
	"codingserve/configs"
	"codingserve/datasource"
	"codingserve/routes"
	"flag"

	"github.com/gin-gonic/gin"
)

var err error

func main() {

	// Read the command line command
	flag.Parse()

	// Create application
	app := gin.Default()

	// Register routes
	routes.Init(app)

	// Migrate databases
	err = datasource.Migrate()
	if err != nil {
		panic(err)
	}

	err = app.Run(":" + configs.SysConfig.Port)
	if err != nil {
		panic(err)
	}
}
