package security

import (
	"codingserve/datasource"
	"codingserve/models"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PermissionCheckMiddleware(permissions []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		info, _ := c.Get("user")
		user, ok := info.(models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"Status": gin.H{
					"Message":       "Failed to get user profile.",
					"MessageDetail": "Check this middleware must after the \"UserVerify\" middleware",
					"Code":          "CODEERR",
				},
				"Response": nil,
			})
			c.Abort()
			return
		}

		var userGroup models.Group
		var userGroupPermissions []string
		var userGroupOk bool
		if err := datasource.GetConnection().Where(&models.Group{ID: user.GroupID}).First(&userGroup).Error; err == nil {
			userGroupOk = true
		} else {
			userGroupOk = false
		}
		if userGroupOk {
			err := json.Unmarshal(userGroup.Permissions, &userGroupPermissions)
			if err != nil {
				c.JSON(http.StatusForbidden, gin.H{
					"Status": gin.H{
						"Message":       "Failed to verify user permission",
						"MessageDetail": "Failed to parse your permissions",
						"Code":          "DATAERR",
					},
					"Response": nil,
				})
				c.Abort()
				return
			}
		}

		var userPermissions []string
		err := json.Unmarshal(user.Permissions, &userPermissions)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"Status": gin.H{
					"Message":       "Failed to verify user permission",
					"MessageDetail": "Failed to parse your permissions",
					"Code":          "DATAERR",
				},
				"Response": nil,
			})
			c.Abort()
			return
		}

		for _, permission := range permissions {
			pass := false
			for _, checkPermission := range userPermissions {
				if permission == checkPermission {
					pass = true
					break
				}
			}
			if !pass && userGroupOk {
				for _, checkPermission := range userGroupPermissions {
					if permission == checkPermission {
						pass = true
						break
					}
				}
			}
			if pass {
				continue
			} else {
				c.JSON(http.StatusForbidden, gin.H{
					"Status": gin.H{
						"Message": "You are not authorized to access here",
						"MessageDetail": "Require permission \"" + permission + "\"",
						"Code":    "BADPERMS",
					},
					"Response": nil,
				})
				c.Abort()
				return
			}
		}
	}
}
