package configs

import (
	"io/ioutil"

	jsoniter "github.com/json-iterator/go"
)

var SysConfig = &sysconfig{}

func init() {
	config, err := ioutil.ReadFile("config.json")
	if err != nil {
		panic("Unable read sysconfig, please check your config file")
	}

	err = jsoniter.Unmarshal(config, SysConfig)
	if err != nil {
		panic(err)
	}
}

type sysconfig struct {
	Port     string   `json:"port"`
	DataBase dbconfig `json:"database"`
}
