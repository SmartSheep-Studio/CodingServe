package main

import (
	"codingserve/configs"
	"codingserve/datasource"
	"codingserve/routes"
	"flag"

	"github.com/kataras/iris/v12"
)

func main() {

	// Read the command line command
	flag.Parse()

	// Create IRIS application
	app := iris.Default()
	app.Favicon("./public/favicon.ico")

	// Register routes
	routes.Init(app)

	// Migrate databases
	datasource.Migrate()

	err := app.Listen(":" + configs.SysConfig.Port)
	if err != nil {
		panic(err)
	}
}
