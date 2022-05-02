package security

import (
	"codingserve/datasource"
	"codingserve/models"
	securityServices "codingserve/services/security"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct {
	connection *gorm.DB

	userService *securityServices.UserService
}

func NewUserController() *UserController {
	controller := &UserController{
		connection:  datasource.GetConnection(),
		userService: securityServices.NewUserService(),
	}
	return controller
}

// Types
type ActiveUserRequest struct {
	VerifyCode string `json:"code" binding:"required"`
}

type LoginUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email"`
}

// Handlers
func (self *UserController) SignUpNewUser(c *gin.Context) {
	var user *models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message": "Provide data scheme is wrong.",
				"Code":    "REQBAD",
			},
			"Response": nil,
		})
		return
	}

	status := self.userService.CreateUser(user, false)
	if !status {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Provide data maybe is wrong.",
				"MessageDetail": "Insert data to database failed.",
				"Code":          "FAILED",
			},
			"Response": nil,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"Status": gin.H{
				"Message": "Sign up successfully.",
				"Code":    "SUCCESS",
			},
			"Response": nil,
		})
	}
}

func (self *UserController) ActiveNewUser(c *gin.Context) {
	var request ActiveUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message": "Provide data scheme is wrong.",
				"Code":    "REQBAD",
			},
			"Response": nil,
		})
		return
	}

	status := self.userService.ActiveUser(request.VerifyCode)
	if !status {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Provide data maybe is wrong.",
				"MessageDetail": "Update data in database failed.",
				"Code":          "FAILED",
			},
			"Response": nil,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"Status": gin.H{
				"Message": "Active user successfully.",
				"Code":    "SUCCESS",
			},
			"Response": nil,
		})
	}
}

func (self *UserController) LoginUser(c *gin.Context) {
	var request LoginUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message": "Provide data scheme is wrong.",
				"Code":    "REQBAD",
			},
			"Response": nil,
		})
		return
	}

	user := self.userService.VerifyUserInformation(request.Username, request.Email, request.Password)
	if user == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message": "Provide data maybe is wrong.",
				"Code":    "REQBAD",
			},
			"Response": nil,
		})
		return
	}

	jwt, err := self.userService.SignUserJWT(user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Failed to sign new JWT.",
				"MessageDetail": err,
				"Code":          "FAILED",
			},
			"Response": nil,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"Status": gin.H{
				"Message": "Login successfully",
				"Code":    "SUCCESS",
			},
			"Response": jwt,
		})
	}
}

func (self *UserController) GetUserProfile(c *gin.Context) {
	profile, _ := c.Get("user")
	c.JSON(http.StatusOK, gin.H{
		"Status": gin.H{
			"Message": "Get profile successfully",
			"Code":    "SUCCESS",
		},
		"Response": profile,
	})
}
