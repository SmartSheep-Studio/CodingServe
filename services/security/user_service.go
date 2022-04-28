package security

import (
	"codingserve/datasource"
	"codingserve/models"
	"codingserve/services"
	"strings"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type UserService struct {
	passwordService *services.PasswordService
}

func NewUserService() *UserService {
	service := &UserService{
		passwordService: &services.PasswordService{},
	}
	return service
}

var connection = datasource.GetConnection()

func (self *UserService) CreateUser(user models.User, force bool) bool {
	userUuid := uuid.New()
	userPassword, _ := self.passwordService.GenerateHash(user.Password)
	codeContent := uuid.New()

	if !force {
		model := models.User{ID: userUuid.String(), Username: user.Username, Password: userPassword, Email: user.Email, Attributes: datatypes.JSON([]byte(`{}`))}
		verify := models.VerifyCode{UID: userUuid.String(), Code: strings.ToUpper(codeContent.String()[:6]), Type: "active"}
		err := connection.Create(&model).Error
		if err != nil {
			return false
		} else {
			err = connection.Create(&verify).Error
			if err != nil {
				return false
			}
		}
	} else {
		model := models.User{ID: userUuid.String(), Username: user.Username, Password: userPassword, Email: user.Email, Attributes: datatypes.JSON([]byte(`{}`)), IsActive: true}
		err := connection.Create(&model).Error
		if err != nil {
			return false
		}
	}

	return true
}

func (self *UserService) ActiveUser(code string) {

}
