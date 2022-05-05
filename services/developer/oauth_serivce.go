package developer

import (
	"codingserve/datasource"
	"codingserve/models"

	"gorm.io/gorm"
)

type OauthService struct {
	connection *gorm.DB
}

func NewOauthService() *OauthService {
	service := &OauthService{
		connection: datasource.GetConnection(),
	}
	return service
}

// Types
type ClientInformation struct {
	Client    models.OauthClient
	Developer models.User
}

// Functions
func (self *OauthService) GetClientInformation(clientID string) (*ClientInformation, string) {
	var client models.OauthClient
	var clientDeveloper models.User

	if err := self.connection.Where(&models.OauthClient{ID: clientID}).First(&client).Error; err != nil {
		return nil, "ClientNotFound"
	}
	if err := self.connection.Where(&models.User{ID: client.DeveloperID}).First(&client).Error; err != nil {
		return nil, "DeveloperNotFound"
	}

  return &ClientInformation{
    Client: client,
    Developer: clientDeveloper,
  }, ""
}
