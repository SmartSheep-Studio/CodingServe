package security

import (
	"codingserve/datasource"
	"codingserve/models"

	"github.com/casbin/casbin/v2"
	"gorm.io/gorm"
)

type GroupService struct {
	connection *gorm.DB
	enforcer   *casbin.Enforcer
}

func NewGroupService() *GroupService {
	service := &GroupService{
		connection: datasource.GetConnection(),
		enforcer:   datasource.GetEnforcer(),
	}
	return service
}

func (self *GroupService) CreateGroup(group models.Group) bool {
	if err := self.connection.Create(&group).Error; err != nil {
		return false
	} else {
		return err == nil
	}
}
