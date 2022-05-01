package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetServerStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"Status": gin.H{
			"Message": "Server information get completed.",
			"Code":    "OK",
		},
		"Response": gin.H{
			"status": "working",
			"server": gin.H{
				"version":     "2.0.0",
				"version-tag": "development",
			},
		},
	})
}
