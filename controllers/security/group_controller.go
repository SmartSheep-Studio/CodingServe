package security

import (
	"codingserve/datasource"
	"codingserve/models"
	securityServices "codingserve/services/security"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type GroupController struct {
	connection *gorm.DB

	groupService *securityServices.GroupService
}

func NewGroupController() *GroupController {
	controller := &GroupController{
		connection:   datasource.GetConnection(),
		groupService: securityServices.NewGroupService(),
	}
	return controller
}

// Types
type UpdateGroupPermissionRequest struct {
	Permissions []string `json:"permissions" binding:"required"`
	GroupID     string   `json:"groupId" binding:"required"`
}

type JoinGroupRequest struct {
	GroupID string `json:"groupId" binding:"required"`
	UserID  string `json:"userId"`
}

// Handlers
func (self *GroupController) GreateGroup(c *gin.Context) {
	var group models.Group
	if err := c.ShouldBindJSON(&group); err != nil {
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

	if self.groupService.CreateGroup(group) {
		c.JSON(http.StatusOK, gin.H{
			"Status": gin.H{
				"Message": "Create group successfully.",
				"Code":    "SUCCESS",
			},
			"Response": nil,
		})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message": "Create group failed.",
				"Code":    "FAILED",
			},
			"Response": nil,
		})
	}
}

func (self *GroupController) JoinGroup(c *gin.Context) {
	var request JoinGroupRequest
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

	var group models.Group
	if err := self.connection.Where(&models.Group{ID: group.ID}).First(&group).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Join group failed.",
				"MessageDetail": "Cannot find group with your provide group id.",
				"Code":          "BADREQ",
			},
			"Response": nil,
		})
		return
	}

	var user models.User
	if request.UserID != "" {
		if err := self.connection.Where(&models.User{ID: request.UserID}).First(&user).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"Status": gin.H{
					"Message":       "Join group failed.",
					"MessageDetail": "Cannot find user with your provide user id.",
					"Code":          "BADREQ",
				},
				"Response": nil,
			})
			return
		}
		user.GroupID = group.ID
		if err := self.connection.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"Status": gin.H{
					"Message":       "Join group failed.",
					"MessageDetail": "Failed to update your profile.",
					"Code":          "SQLERR",
				},
				"Response": nil,
			})
		} else {
			c.JSON(http.StatusOK, gin.H{
				"Status": gin.H{
					"Message": "Join group successfully.",
					"Code":    "SUCCESS",
				},
				"Response": nil,
			})
		}
	} else {
		profile, _ := c.Get("user")
		user := profile.(models.User)
		user.GroupID = group.ID
		if err := self.connection.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"Status": gin.H{
					"Message":       "Join group failed.",
					"MessageDetail": "Failed to update your profile.",
					"Code":          "SQLERR",
				},
				"Response": nil,
			})
		} else {
			c.JSON(http.StatusOK, gin.H{
				"Status": gin.H{
					"Message": "Join group successfully.",
					"Code":    "SUCCESS",
				},
				"Response": nil,
			})
		}
	}
}
