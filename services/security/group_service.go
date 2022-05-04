package security

import (
	"codingserve/datasource"
	"codingserve/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GroupService struct {
	connection *gorm.DB
}

func NewGroupService() *GroupService {
	service := &GroupService{
		connection: datasource.GetConnection(),
	}
	return service
}

func (self *GroupService) CreateGroup(group models.Group) bool {
	// Override provide details
	if group.ID == "" {
		group.ID = uuid.New().String()
	}
	if err := self.connection.Create(&group).Error; err != nil {
		return false
	} else {
		return err == nil
	}
}
