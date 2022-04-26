package configs

type dbconfig struct {
	UserName string `json:"username"`
	Password string `json:"password"`
	Host     string `json:"host"`
	BaseName string `json:"basename"`
}
