# rest-social-auth jQuery Plugin

**Note: this project is under construction, use at your own risk**

This is a helper plugin for restful social authentication.

I built this for use with https://github.com/st4lk/django-rest-social-auth but you could use it with any OAUTH2 provider.

```
provider: 'google',
redirect_uri: 'http://localhost/',
client_id: '############.apps.googleusercontent.com',
scope: ['username', 'email'],
backend_uri: 'http://localhost:8000/login/social/jwt_user/google-oauth2',
success: function(result)
fail: function() 
```

Loosely based on the angular project https://github.com/sahat/satellizer
