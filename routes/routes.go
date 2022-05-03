package routes

import (
	"github.com/gin-gonic/gin"

	rootControllers "codingserve/controllers"
	securityControllers "codingserve/controllers/security"

	securityMiddlewares "codingserve/middleware/security"
)

func Init(app *gin.Engine) {

	// Register APIs
	prefix := "/api"

	apiHandlers := app.Group(prefix)
	{
		apiHandlers.GET("", rootControllers.GetServerStatus)

		securityHandlers := apiHandlers.Group("/security")
		{
			controller := securityControllers.NewUserController()
			securityHandlers.POST("/users", controller.SignUpNewUser)
			securityHandlers.POST("/users/login", controller.LoginUser)
			securityHandlers.POST("/users/active", controller.ActiveNewUser)

			securityHandlers.Group("/users/profile", securityMiddlewares.UserVerifyHandler(), securityMiddlewares.PermissionCheckMiddleware([]string{"read:profile"})).GET("", controller.GetUserProfile)
		}
	}

	// Render CodingUI
	app.Static("/favicon.ico", "./public/favicon.ico")
	app.Static("/assets", "./public/assets")
	app.NoRoute(func(c *gin.Context) {
		c.File("./public/index.html")
	})
}
