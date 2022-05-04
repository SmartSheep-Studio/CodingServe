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
