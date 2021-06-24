from django.urls import path
from .views import *

urlpatterns = [
    path('register', Register.as_view()),
    path('create', CreateTask.as_view()),
    path('auth',CheckAuth.as_view()),
    path('login',Login.as_view()),
    path('logout',LogOut.as_view()),
    path('edit',Edit.as_view()),
    path('delete',Delete.as_view()),
]

"""     path('tasks/', GetTasks.as_view()),
    path('task/<int:id>/', GetTask.as_view()), """