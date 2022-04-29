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

// Types
type ActiveUserRequest struct {
	VerifyCode string `json:"code" binding:"required"`
}

func (self *UserController) SignUpNewUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Provide data scheme is wrong",
			"code":    "DATAERR",
		})
		return
	}

	status := self.userService.CreateUser(user, false)
	if !status {
		c.JSON(http.StatusBadRequest, gin.H{
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

func (self *UserController) ActiveNewUser(c *gin.Context) {
	var request ActiveUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Provide data scheme is wrong",
			"code":    "DATAERR",
		})
		return
	}

	status := self.userService.ActiveUser(request.VerifyCode)
	if !status {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Failed to verify your account, check your provide data",
			"code":    "FAILED",
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"message": "Verifed successfully",
			"code":    "SUCCESS",
		})
	}
}
