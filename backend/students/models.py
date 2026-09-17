from django.core.validators import RegexValidator
from django.db import models


class Student(models.Model):
    class Department(models.TextChoices):
        CSE = 'CSE', 'Computer Science'
        ECE = 'ECE', 'Electronics & Communication'
        EEE = 'EEE', 'Electrical & Electronics'
        MECH = 'MECH', 'Mechanical'
        CIVIL = 'CIVIL', 'Civil'
        IT = 'IT', 'Information Technology'

    class Gender(models.TextChoices):
        MALE = 'Male', 'Male'
        FEMALE = 'Female', 'Female'
        OTHER = 'Other', 'Other'

    phone_validator = RegexValidator(
        regex=r'^\d{10}$',
        message='Phone number must be exactly 10 digits.',
    )

    # id (primary key) is created automatically by Django as an
    # auto-incrementing integer.
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, validators=[phone_validator])
    department = models.CharField(max_length=10, choices=Department.choices)
    year = models.PositiveSmallIntegerField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.department}, Year {self.year})'
