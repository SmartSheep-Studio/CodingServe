package security

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/storyicon/grbac"
)

func BearerIntrospection() gin.HandlerFunc {
	return func(c *gin.Context) {
		authorization := c.Request.Header.Get("Authorization")
		if authorization == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Authorization failure, require Authorization header",
				"code":    "UNAUTH",
			})
			c.Abort()
			return
		}
		bearer := strings.TrimPrefix(authorization, "Bearer ")
		if bearer == authorization {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Authorization failure, require Bearer scheme",
				"code":    "UNAUTH",
			})
			c.Abort()
			return
		}
	}
	rbac, err := grbac.New(grbac.WithLoader(LoadAuthorizationRules, time.Minute))
	if err != nil {
		panic(err)
	}
	return func(c *gin.Context) {
		roles, err := QueryRolesByHeaders(c.Request.Header)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		state, _ := rbac.IsRequestGranted(c.Request, roles)
		if !state.IsGranted() {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
	}
}
