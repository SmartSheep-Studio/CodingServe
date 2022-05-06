package developer

import (
	"codingserve/datasource"
	"codingserve/models"
	developerServices "codingserve/services/developer"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DeveloperController struct {
	connection *gorm.DB

	developerService *developerServices.DeveloperService
}

func NewDeveloperController() *DeveloperController {
	controller := &DeveloperController{
		connection:       datasource.GetConnection(),
		developerService: developerServices.NewDeveloperService(),
	}
	return controller
}

// Types
type JoinDeveloperRequest struct {
	Force bool `json:"force"`
}

// Handlers
func (self *DeveloperController) JoinDeveloper(c *gin.Context) {
	var request JoinDeveloperRequest
	_ = c.BindJSON(&request)

	profile, _ := c.Get("user")
	user := profile.(models.User)

	status, err := self.developerService.JoinDeveloper(user, request.Force)
	if !status {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status": gin.H{
				"Message":       "Join developer failed",
				"MessageDetail": err,
				"Code":          "FAILED",
			},
			"Response": nil,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"Status": gin.H{
				"Message": "Join developer successfully",
				"Code":    "SUCCESS",
			},
			"Response": nil,
		})
	}
}
