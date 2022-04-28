package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetServerStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"code":   "SERVEOK",
		"status": "working",
		"server": gin.H{
			"version":     "2.0.0",
			"version-tag": "development",
		},
	})
}
