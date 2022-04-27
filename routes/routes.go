package routes

import (
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/mvc"

	controllers "codingserve/controllers"
	securityControllers "codingserve/controllers/security"
)

func Init(app *iris.Application) {

	// Render CodingUI
	app.HandleDir("/assets", iris.Dir("./public/assets"))
	app.HandleDir("/", iris.Dir("./public"), iris.DirOptions{
		ShowList: true, Compress: true, IndexName: "index.html",
	})

	// Register APIs
	prefix := "/api"
	mvc.New(app.Party(prefix)).Handle(new(controllers.StatusController))

	mvc.New(app.Party(prefix + "/security/users")).Handle(new(securityControllers.UserController))
}
