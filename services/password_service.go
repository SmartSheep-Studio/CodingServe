package services

import (
	"golang.org/x/crypto/bcrypt"
)

type PasswordService struct{}

func (self *PasswordService) GenerateHash(text string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(text), 2)
	return string(bytes), err
}

func (self *PasswordService) CompareHash(text, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(text))
	return err == nil
}
