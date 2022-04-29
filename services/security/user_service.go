package security

import (
	"codingserve/datasource"
	"codingserve/models"
	"codingserve/services"
	"strings"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type UserService struct {
	connection *gorm.DB

	verifyCodeService *VerifyCodeService
	passwordService *services.PasswordService
}

func NewUserService() *UserService {
	service := &UserService{
		connection: datasource.GetConnection(),

		verifyCodeService: &VerifyCodeService{},
		passwordService: &services.PasswordService{},
	}
	return service
}

func (self *UserService) CreateUser(user models.User, force bool) bool {
	userUuid := uuid.New()
	userPassword, _ := self.passwordService.GenerateHash(user.Password)
	codeContent := uuid.New()

	if !force {
		model := models.User{ID: userUuid.String(), Username: user.Username, Password: userPassword, Email: user.Email, Attributes: datatypes.JSON([]byte(`{}`))}
		verify := models.VerifyCode{UID: userUuid.String(), Code: strings.ToUpper(codeContent.String()[:6]), Type: "active"}
		err := self.connection.Create(&model).Error
		if err != nil {
			return false
		} else {
			if !self.verifyCodeService.SendVerifyCode(verify) {
				return false
			}
		}
	} else {
		model := models.User{ID: userUuid.String(), Username: user.Username, Password: userPassword, Email: user.Email, Attributes: datatypes.JSON([]byte(`{}`)), IsActive: true}
		err := self.connection.Create(&model).Error
		return err != nil
	}

	return true
}

func (self *UserService) ActiveUser(code string) bool {
	var err error

	var verifyCode models.VerifyCode
	var verifyUser models.User
	if err = self.connection.Where(models.VerifyCode{Code: code}).First(&verifyCode).Error; err != nil {
    return false
	} else {
		if err = self.connection.Where(models.User{ID: verifyCode.UID}).First(&verifyUser).Error; err != nil {
			return false
		}
	}

	if !self.verifyCodeService.IsVerifyCodeAvailable(verifyCode) {
		return false
	}

	verifyUser.IsActive = true
	if !self.verifyCodeService.DeleteVerifyCode(verifyCode) {
	  err = self.connection.Save(&verifyUser).Error
		return err != nil
	} else {
		return false
	}
}
