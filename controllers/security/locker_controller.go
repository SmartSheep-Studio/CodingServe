package security

import (
	"codingserve/datasource"
	"codingserve/models"
	securityServices "codingserve/services/security"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LockerController struct {
	connection *gorm.DB

	lockerService *securityServices.LockerService
}

func NewLockerController() *LockerController {
	controller := &LockerController{
		connection:    datasource.GetConnection(),
		lockerService: securityServices.NewLockerService(),
	}
	return controller
}

// Types
type ReportUserRequest struct {
	Reason  string `json:"reason" binding:"required"`
	UserID  string `json:"userId" binding:"required"`
}

type LockUserRequest struct {
	Reason  string `json:"reason" binding:"required"`
	Instant *bool  `json:"instant" binding:"required"`
	UserID  string `json:"userId" binding:"required"`
}

// Handlers
func (self *LockerController) ReportUser(c *gin.Context) {
	var request ReportUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Provide data scheme is wrong.",
				"MessageDetail": err,
				"Code":          "REQBAD",
			},
			"Response": nil,
		})
		return
	}
	profile, _ := c.Get("user")
	issuer := profile.(models.User)

	var user *models.User
	if err := self.connection.Where(&models.User{ID: request.UserID}).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Provide data is wrong.",
				"MessageDetail": "Cannot use your UserID to find will report user.",
				"Code":          "REQBAD",
			},
			"Response": nil,
		})
		return
	}

	status, err := self.lockerService.LockUserResource(user, issuer, request.Reason, false)
	if !status {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Provide data is wrong.",
				"MessageDetail": "Cannot report user because: " + err,
				"Code":          "REQBAD",
			},
			"Response": nil,
		})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{
			"Status": gin.H{
				"Message":       "Report user \"" + user.Username + "\" successfully.",
				"MessageDetail": err,
				"Code":          "SUCCESS",
			},
			"Response": nil,
		})
		return
	}
}

func (self *LockerController) LockUser(c *gin.Context) {
	var request LockUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Provide data scheme is wrong.",
				"MessageDetail": err,
				"Code":          "REQBAD",
			},
			"Response": nil,
		})
		return
	}
	profile, _ := c.Get("user")
	issuer := profile.(models.User)

	var user *models.User
	if err := self.connection.Where(&models.User{ID: request.UserID}).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Provide data is wrong.",
				"MessageDetail": "Cannot use your UserID to find will lock user.",
				"Code":          "REQBAD",
			},
			"Response": nil,
		})
		return
	}

	status, err := self.lockerService.LockUserResource(user, issuer, request.Reason, *request.Instant)
	if !status {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Provide data is wrong.",
				"MessageDetail": "Cannot lock user because: " + err,
				"Code":          "REQBAD",
			},
			"Response": nil,
		})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{
			"Status": gin.H{
				"Message":       "Lock user \"" + user.Username + "\" successfully.",
				"MessageDetail": err,
				"Code":          "SUCCESS",
			},
			"Response": nil,
		})
		return
	}
}
