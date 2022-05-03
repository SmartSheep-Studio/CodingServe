package security

import (
	"codingserve/configs"
	"codingserve/datasource"
	"codingserve/models"
	"codingserve/services"
	"encoding/json"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type UserService struct {
	connection *gorm.DB

	verifyCodeService *VerifyCodeService
	passwordService   *services.PasswordService
}

func NewUserService() *UserService {
	service := &UserService{
		connection: datasource.GetConnection(),

		verifyCodeService: NewVerifyCodeService(),
		passwordService:   &services.PasswordService{},
	}
	return service
}

func (self *UserService) CreateUser(user *models.User, force bool) bool {
	userUuid := uuid.New()
	userPassword, _ := self.passwordService.GenerateHash(user.Password)
	codeContent := uuid.New()

	permissions := datatypes.JSON([]byte(`[]`))
	var defaultPermissions []models.Permission
	var defaultOnlyPermissions []string
	if err := self.connection.Select("permission").Where(&models.Permission{IsDefault: true}).Find(&defaultPermissions).Error; err != nil {
		return false
	} else {
		for _, permission := range defaultPermissions {
			defaultOnlyPermissions = append(defaultOnlyPermissions, permission.Permission)
		}
	}
	if len(defaultPermissions) != 0 {
		permissionsJSON, err := json.Marshal(defaultOnlyPermissions)
		if err != nil {
			return false
		}
		permissions = datatypes.JSON([]byte(permissionsJSON))
	}

	if !force {
		model := models.User{ID: userUuid.String(), Username: user.Username, Password: userPassword, Email: user.Email, Attributes: datatypes.JSON([]byte(`{}`)), Permissions: permissions}
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
		model := models.User{ID: userUuid.String(), Username: user.Username, Password: userPassword, Email: user.Email, Attributes: datatypes.JSON([]byte(`{}`)), Permissions: permissions, IsActive: true}
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

	if verifyCode.Type == "active" && !self.verifyCodeService.IsVerifyCodeAvailable(verifyCode) {
		return false
	}

	verifyUser.IsActive = true
	if !self.verifyCodeService.DeleteVerifyCode(verifyCode) {
		err = self.connection.Save(&verifyUser).Error
		return err == nil
	} else {
		return false
	}
}

func (self *UserService) SignUserJWT(user *models.User) (string, error) {
	claims := &jwt.RegisteredClaims{
		Issuer:    user.ID,
		Subject:   "Login",
		Audience:  []string{"CodingLand"},
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(2 * 24 * time.Hour)),
		NotBefore: jwt.NewNumericDate(time.Now()),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ID:        uuid.New().String(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(configs.SysConfig.Secret))

	return signed, err
}

func (self *UserService) VerifyUserInformation(username, password string) *models.User {
	var user *models.User
	if err := self.connection.Where(&models.User{Username: username}).First(&user).Error; err != nil {
		if err := self.connection.Where(&models.User{Email: username}).First(&user).Error; err != nil {
			return nil
		}
	}
	if !self.passwordService.CompareHash(password, user.Password) {
		return nil
	} else {
		return user
	}
}

func (self *UserService) AddUserIntoGroup(user *models.User, group *models.Group) bool {
	if user.GroupID != "" {
		return false
	}

	user.GroupID = group.ID
	return self.connection.Save(&user).Error == nil
}
