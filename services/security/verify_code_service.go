package security

import (
	"codingserve/datasource"
	"codingserve/models"
	"time"

	"gorm.io/gorm"
)

type VerifyCodeService struct {
	connection *gorm.DB
}

func NewVerifyCodeService() *VerifyCodeService {
	service := &VerifyCodeService{
		connection: datasource.GetConnection(),
	}
	return service
}

func (self *VerifyCodeService) SendVerifyCode(code models.VerifyCode) bool {
	if err := self.connection.Create(&code).Error; err != nil {
		return false
	} else {
		// TODO: Send verify code
		return true
	}
}

func (self *VerifyCodeService) IsVerifyCodeAvailable(code models.VerifyCode) bool {
  expiredAt := code.CreatedAt.Add(2 * time.Hour)
	return code.CreatedAt.Before(expiredAt)
}

func (self *VerifyCodeService) DeleteVerifyCode(code models.VerifyCode) bool {
		return self.connection.Delete(&code).Error != nil
}
