package services

import (
	"codingserve/datasource"
	"codingserve/models"
	"strings"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type UserService interface {
	CreateUser(user models.User, force bool) bool
	ActiveUser(code string)
}

type UserServiceImpl struct{}

func NewUserService() UserService {
	return &UserServiceImpl{}
}

var connection = datasource.GetConnection()

func (self *UserServiceImpl) CreateUser(user models.User, force bool) bool {
	userUuid, _ := uuid.NewUUID()
	codeContent, _ := uuid.NewUUID()
	model := models.User{ID: userUuid.String(), Username: user.Username, Password: user.Password, Email: user.Email, Attributes: datatypes.JSON{}}
	verify := models.VerifyCode{UID: userUuid.String(), Code: strings.ToUpper(codeContent.String()[:6]), Type: "active"}
	result := connection.Create(&model)
	if result.Error == nil {
		return false
	}
	result = connection.Create(&verify)
	if result.Error == nil {
		return false
	}

	return true
}

func (self *UserServiceImpl) ActiveUser(code string) {

}
