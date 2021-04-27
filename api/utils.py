from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
def checkLogin(token):
    token = Token.objects.filter(key=token)
    if len(token)>0:
        return token
    return False