package security

import (
	"codingserve/models"
	"codingserve/services"

	"github.com/kataras/iris/v12"
)

type UserController struct {
	Service services.UserService
}

func NewUserController() *UserController {
	return &UserController{Service: services.NewUserService()}
}

func (self *UserController) Post(user models.User) iris.Map {
	status := self.Service.CreateUser(user, false)
	if status == true {
		return iris.Map{
			"message": "Failed to sign up",
			"code":    "FAILED",
		}
	} else {
		return iris.Map{
			"message": "Sign up successfully",
			"code":    "SUCCESS",
		}
	}
}
