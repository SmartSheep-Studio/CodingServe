package security

import (
	"codingserve/configs"
	"codingserve/datasource"
	"codingserve/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func UserVerifyHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		authorization := c.Request.Header.Get("Authorization")
		if authorization == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"Status": gin.H{
					"Message":       "Authorization failed",
					"MessageDetail": "Require Authorization Header",
					"Code":          "BADREQ",
				},
				"Response": nil,
			})
			c.Abort()
			return
		}
		bearer := strings.TrimPrefix(authorization, "Bearer ")
		if bearer == authorization {
			c.JSON(http.StatusUnauthorized, gin.H{
				"Status": gin.H{
					"Message":       "Authorization failed",
					"MessageDetail": "Require Bearer Token",
					"Code":          "BADREQ",
				},
				"Response": nil,
			})
			c.Abort()
			return
		}

		token, err := jwt.ParseWithClaims(bearer, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(configs.SysConfig.Secret), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"Status": gin.H{
					"Message":       "Authorization failed",
					"MessageDetail": err,
					"Code":          "FAILED",
				},
				"Response": nil,
			})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(*jwt.RegisteredClaims); ok && token.Valid {
			var user models.User
			if claims.Audience[0] == "CodingLand" && claims.Issuer != "" {
				if err := datasource.GetConnection().Where(&models.User{ID: claims.Issuer}).First(&user).Error; err == nil {
					c.Set("user", user)
					c.Set("bearer", bearer)
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{
						"Status": gin.H{
							"Message":       "Authorization failed",
							"MessageDetail": "Failed to get your profile and verify your data",
							"Code":          "SQLERR",
						},
						"Response": nil,
					})
					c.Abort()
				}
			}
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{
				"Status": gin.H{
					"Message":       "Authorization failed",
					"MessageDetail": "Decode or validate failed",
					"Code":          "BADREQ",
				},
				"Response": nil,
			})
			c.Abort()
		}
	}
}
