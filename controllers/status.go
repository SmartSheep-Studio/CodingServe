package controllers

import "github.com/kataras/iris/v12"

type StatusController struct{}

func (c *StatusController) Get() iris.Map {
  return iris.Map{
    "status": "working",
    "server": iris.Map{
      "version": "2.0.0",
      "version-tag": "development",
    },
  }
}
