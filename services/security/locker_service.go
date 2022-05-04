package security

import (
	"codingserve/datasource"
	"codingserve/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LockerService struct {
	connection *gorm.DB
}

func NewLockerService() *LockerService {
	service := &LockerService{
		connection: datasource.GetConnection(),
	}
	return service
}

func (self *LockerService) LockResource(issuer, reason string, instant bool) (*models.ResourcesLock, string) {
	information := &models.ResourcesLock{ID: uuid.New().String(), IssuerID: issuer, Description: reason, Status: "processing"}
	if instant {
		information.Status = "locked"
	}

	if err := self.connection.Create(&information).Error; err != nil {
		return nil, "InsertFailed"
	}

	return information, ""
}

func (self *LockerService) UpdateLockInformation(lock models.ResourcesLock, status string) bool {
	lock.Status = status
	if err := self.connection.Save(&lock).Error; err != nil {
		return false
	} else {
		return true
	}
}

func (self *LockerService) LockUserResource(user *models.User, issuer models.User, reason string, instant bool) (bool, string) {
	var lock models.ResourcesLock
	if user.IsLocked {
		return false, "AlreadyLocked"
	}
	if err := self.connection.Where(&models.ResourcesLock{ID: user.LockedID}).First(&lock).Error; err == nil {
		if lock.Status != "processing" {
			return true, "AlreadyLocked"
		}
		if instant {
			ok := self.UpdateLockInformation(lock, "locked")
			if !ok {
				return false, "UpdateLockInformationFailed"
			}
			user.IsLocked = true
			self.connection.Save(&user)
			return true, ""
		} else {
			lock.AgreeCount++
			self.connection.Save(&lock)
			return true, "AlreadyRequestLocked"
		}
	}

	information, err := self.LockResource(issuer.ID, reason, instant)
	if err != "" {
		return false, err
	} else {
		user.LockedID = information.ID
		if instant {
			user.IsLocked = true
		}
		self.connection.Save(&user)
		return true, ""
	}
}
