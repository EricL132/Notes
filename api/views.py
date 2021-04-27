from django.shortcuts import render
from django.core.serializers import serialize
from rest_framework import status,generics
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework.authtoken.models import Token
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Task
import json
from .utils import checkLogin
# Create your views here.

class Register(APIView):
    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        if len(User.objects.filter(username=request.data["user"]))>0:
            return Response({"status":"Username taken"},status=status.HTTP_400_BAD_REQUEST)
        user  = User.objects.create_user(username=request.data["user"],password=request.data["password"])
        token = Token.objects.create(user=user) 
        expires_in = timezone.now() + timedelta(seconds=10)
        token.id=user.id 
        token.save()
        self.request.session["auth"] = token.key
        return Response({"res":"Registered"},status=status.HTTP_200_OK)

class CheckAuth(APIView):
    def get(self,request,format=None):
        token = Token.objects.filter(key=self.request.session.get("auth"))
        if token:
            user = token[0].user_id
            tasks = Task.objects.filter(user=user)
            return Response({"tasks":list(tasks.values("id","title","description","complete"))},status=status.HTTP_200_OK)
        return Response({},status=status.HTTP_401_UNAUTHORIZED)
        
class Login(APIView):
    def post(self,request,format=None):
        username = request.data["username"].lower()
        user = authenticate(username=username,password=request.data["password"])
        if user:
            if not self.request.session.exists(self.request.session.session_key):
                self.request.session.create()
            token = Token.objects.create(user=user)
            token.id=user.id
            token.save()
            self.request.session["auth"] = token.key
            return Response({"status":"Logged in"},status=status.HTTP_200_OK)
        return Response({"status":"Invalid Email/Password"},status=status.HTTP_401_UNAUTHORIZED)

class Edit(APIView):
    def post(self,request,format=None):
        if request.data["title"] and request.data["description"]:
            login = checkLogin(self.request.session["auth"])
            if login:
                user = login[0].user_id
                task = Task.objects.filter(id=request.data["id"])
                if len(task)>0 and user==task[0].user_id:
                    task[0].title = request.data["title"]
                    task[0].description = request.data["description"]
                    task[0].save()
                    return Response({"status":"Successfully changed note"},status=status.HTTP_200_OK)
                return Response({"status":"Unauthorized/Login doesnt match"},status=status.HTTP_401_UNAUTHORIZED)
            return Response({"status":"Unauthorized/Login required"},status=status.HTTP_401_UNAUTHORIZED)
        return Response({"status":"Invalid Fields"},status=status.HTTP_400_BAD_REQUEST)

class Delete(APIView):
    def post(self,request,format=None):
        if request.data["id"]:
            login = checkLogin(self.request.session["auth"])
            if login:
                user = login[0].user_id
                task = Task.objects.filter(id=request.data["id"])
                if len(task)>0 and user==task[0].user_id:
                    task[0].delete()
                    return Response({"status":"Successfully deleted note"},status=status.HTTP_200_OK)
                return Response({"status":"Unauthorized/Login doesnt match"},status=status.HTTP_401_UNAUTHORIZED)
            return Response({"status":"Unauthorized/Login required"},status=status.HTTP_401_UNAUTHORIZED)
        return Response({"status":"Invalid Fields"},status=status.HTTP_400_BAD_REQUEST)

class LogOut(APIView):
    def post(self,request,format=None):
        token = Token.objects.filter(key=self.request.session.get("auth"))
        if token:
            token[0].delete()
            return Response({"status":"Logged out"},status=status.HTTP_200_OK)
        return Response({},status=status.HTTP_401_UNAUTHORIZED)


class CreateTask(APIView):
    def post(self,request,format=None):
        token = Token.objects.filter(key=self.request.session["auth"])
        if token and request.data["title"]:
            token = token[0].user_id
            user = User.objects.filter(id=token)[0]
            newTask = Task(user=user,title=request.data["title"],description=request.data["description"])
            newTask.save()
            tasks = Task.objects.filter(user=token)
        return Response({"tasks":list(tasks.values("title","description","id"))},status=status.HTTP_200_OK)
