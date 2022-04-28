package security

import (
	"codingserve/models"
	securityServices "codingserve/services/security"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService    *securityServices.UserService
}

func NewUserController() *UserController {
	controller := &UserController{
		userService: securityServices.NewUserService(),
	}
	return controller
}
func (self *UserController) SignUpNewUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Provide user information is wrong",
			"code":    "DATAERR",
		})
		return
	}

	status := self.userService.CreateUser(user, false)
	if !status {
		c.JSON(http.StatusOK, gin.H{
			"message": "Sign up failed, check your provide data",
			"code":    "FAILED",
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"message": "Sign up successfully",
			"code":    "SUCCESS",
		})
	}
}
