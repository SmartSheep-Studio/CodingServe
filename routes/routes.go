package routes

import (
	"github.com/kataras/iris/v12"

	"codingserve/controllers"
	"github.com/kataras/iris/v12/mvc"
)

func Init(app *iris.Application) {

	// Render CodingUI
	app.HandleDir("/assets", iris.Dir("./public/assets"))
	app.HandleDir("/", iris.Dir("./public"), iris.DirOptions{
		ShowList: true, Compress: true, IndexName: "index.html",
	})

	// Register APIs
	prefix := "/api"
	apiHandlers := app.Party(prefix)
	{
		apiHandlers.Use(iris.Compression)

		mvc.New(apiHandlers).Handle(new(controllers.StatusController))
	}
}
