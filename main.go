package main

import (
	"codingserve/configs"
	"codingserve/controllers"
	"flag"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/mvc"
)

func main() {

	// Read the command line command
	flag.Parse()

	// Create IRIS application
	app := iris.New()
	app.Favicon("./public/favicon.ico")

	// TODO: Move this route to router
	app.HandleDir("/assets", iris.Dir("./public/assets"))
	app.HandleDir("/", iris.Dir("./public"), iris.DirOptions{
		ShowList: true, Compress: true, IndexName: "index.html",
	})

	apiHandlers := app.Party("/api")
	{
		apiHandlers.Use(iris.Compression)

		mvc.New(apiHandlers).Handle(new(controllers.StatusController))
	}

	err := app.Listen(":" + configs.SysConfig.Port)
	if err != nil {
		panic(err)
	}
}
