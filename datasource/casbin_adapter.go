package datasource

import (
	"github.com/casbin/casbin/v2"
	gormadapter "github.com/casbin/gorm-adapter/v3"
)

var enforcerAdapter *gormadapter.Adapter
var enforcer *casbin.Enforcer

func InitAdapter() {
	enforcerAdapter, _ = gormadapter.NewAdapterByDB(GetConnection())
	enforcer, _ = casbin.NewEnforcer("casbin/model.conf", enforcerAdapter)
	enforcer.LoadPolicy()
}

func GetEnforcer() *casbin.Enforcer {
	return enforcer
}

func GetEnforcerAdapter() *gormadapter.Adapter {
	return enforcerAdapter
}
