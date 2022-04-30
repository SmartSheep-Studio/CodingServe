package security

import (
	"codingserve/datasource"

	"gorm.io/gorm"
)

type JWTService struct {
	connection *gorm.DB
}

func NewJWTService() *JWTService {
	service := &JWTService{
		connection: datasource.GetConnection(),
	}
	return service
}
