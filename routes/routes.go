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
			userController := securityControllers.NewUserController()
			securityHandlers.POST("/users/signup", userController.SignUpNewUser)
			securityHandlers.POST("/users/login", userController.LoginUser)
			securityHandlers.POST("/users/active", userController.ActiveNewUser)
			securityHandlers.Group("/users/profile", securityMiddlewares.UserVerifyHandler()).GET("", userController.GetUserProfile)

			lockerController := securityControllers.NewLockerController()
			securityHandlers.Group("/locks/report/user", securityMiddlewares.UserVerifyHandler()).POST("", lockerController.ReportUser)
			securityHandlers.Group("/locks/user", securityMiddlewares.UserVerifyHandler(), securityMiddlewares.PermissionCheckMiddleware([]string{"write:locks"})).POST("", lockerController.LockUser)

			groupController := securityControllers.NewGroupController()
			securityHandlers.Group("/groups", securityMiddlewares.UserVerifyHandler(), securityMiddlewares.PermissionCheckMiddleware([]string{"write:groups"})).POST("", groupController.GreateGroup)
			securityHandlers.Group("/groups", securityMiddlewares.UserVerifyHandler(), securityMiddlewares.PermissionCheckMiddleware([]string{"write:groups"})).PUT("", groupController.JoinGroup)
		}
	}

	// Render CodingUI
	app.Static("/favicon.ico", "./public/favicon.ico")
	app.Static("/assets", "./public/assets")
	app.NoRoute(func(c *gin.Context) {
		c.File("./public/index.html")
	})
}
