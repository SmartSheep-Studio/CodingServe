package security

import (
	"codingserve/datasource"
	"codingserve/models"

	"gorm.io/datatypes"
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

func (self *GroupService) CreateGroup(group models.Group, force bool) bool {
	// Override provide details
	if !force {
		group.Permissions = datatypes.JSON([]byte(`[]`))
	}
	if err := self.connection.Create(&group).Error; err != nil {
		return false
	} else {
		return err == nil
	}
}
