package developer

import (
	"codingserve/datasource"
	"codingserve/models"
	securityService "codingserve/services/security"

	"gorm.io/gorm"
)

type DeveloperService struct {
	connection *gorm.DB

	groupService *securityService.GroupService
}

func NewDeveloperService() *DeveloperService {
	service := &DeveloperService{
		connection:   datasource.GetConnection(),
		groupService: securityService.NewGroupService(),
	}
	return service
}

func (self *DeveloperService) JoinDeveloper(user models.User) (bool, string) {
	var developerGroup models.Group
	if err := self.connection.Where(&models.Group{ID: "developer"}).First(&developerGroup).Error; err != nil {
		return false, "DeveloperGroupNotFound"
	}

	return self.groupService.JoinGroup(user, developerGroup)
}
