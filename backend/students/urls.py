from django.urls import path

from . import views

urlpatterns = [
    path('students/', views.student_list, name='student-list'),
    path('students/<int:pk>/', views.student_detail, name='student-detail'),
]
