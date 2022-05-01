package security

import (
	"codingserve/datasource"
	"codingserve/models"
	"fmt"
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

		var secret []byte
		token, _ := jwt.Parse(bearer, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			}

			return secret, nil
		})

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			var user models.User
			if claims["iss"] != nil {
				if err := datasource.GetConnection().Where(&models.User{ID: user.ID}).First(&user).Error; err != nil {
					c.Set("user", user)
					c.Set("bearer", bearer)
					return
				}
			}
		}

		c.JSON(http.StatusUnauthorized, gin.H{
			"Status": gin.H{
				"Message":       "Authorization failed",
				"MessageDetail": "Invaild Token",
				"Code":          "BADREQ",
			},
			"Response": nil,
		})
		c.Abort()
	}
}
