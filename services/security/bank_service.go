package security

import (
	"codingserve/datasource"
	"codingserve/models"

	"gorm.io/gorm"
)

type BankService struct {
	connection *gorm.DB
}

func NewBankService() *BankService {
	service := &BankService{
		connection: datasource.GetConnection(),
	}
	return service
}

func (self *BankService) CreateBank(bank models.BankAccount) bool {
	if err := self.connection.Create(&bank).Error; err != nil {
		return false
	}
	return true
}

// func (self *BankService) TransferMoney(payer models.BankAccount, payee models.BankAccount, currency models.BankCurrency, description string, amount int) (*models.BankTransfer, string) {
// 	// Check payer balance
// 	var payerBalance []string
// 	if err := json.Unmarshal(payer.HasBalance, &payerBalance); err != nil {
// 		return nil, "BalanceParseError"
// 	}
// 	if payerBalance[currency.ID]
// 	// Create order
// 	transfer := &models.BankTransfer{
// 		PayerID:     payer.ID,
// 		PayeeID:     payee.ID,
// 		PayType:     "money",
// 		PayObjectID: currency.ID,
// 		Description: description,
// 		Amount:      int64(amount),
// 	}
// 	// Update payee and payer balance

// 	// Update into database
// 	if err := self.connection.Create(&transfer).Error; err != nil {
// 		return nil, "SQLError"
// 	}
// 	return transfer, ""
// }
