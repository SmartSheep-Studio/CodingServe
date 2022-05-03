package security

import (
	"codingserve/datasource"
	"codingserve/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wxnacy/wgo/arrays"
)

func PermissionCheckMiddleware(permissions []*models.Permission) gin.HandlerFunc {
  return func(c *gin.Context) {
		info, _ := c.Get("user")
		user, ok := info.(models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"Status": gin.H{
					"Message": "Failed to get user profile.",
					"MessageDetail": "Check this middleware must after the \"UserVerify\" middleware",
					"Code": "CODEERR",
				},
				"Response": nil,
			})
			c.Abort()
			return
		}
		for _, permission := range user.Permissions {
			var userPermission models.Permission
			if err := datasource.GetConnection().Where(&models.Permission{ID: uint(permission)}).First(&userPermission).Error; err != nil {
				c.JSON(http.StatusForbidden, gin.H{
					"Status": gin.H{
						"Message": "Failed to verify your permission",
						"MessageDetail": "Failed to get your permission list",
						"Code": "SQLERR",
					},
					"Response": nil,
				})
			}
		}

		for _, permission := range permissions {
			index := arrays.Contains(user.Permissions, permission.ID)
			if index != -1 {
				continue
			} else {
				c.JSON(http.StatusForbidden, gin.H{
					"Status": gin.H{
						"Message": "Failed to verify user permission",
						"Code": "BADPERMS",
					},
					"Response": nil,
				})
				c.Abort()
				return
			}
		}
  }
}
