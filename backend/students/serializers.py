from rest_framework import serializers

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id', 'name', 'email', 'phone', 'department',
            'year', 'gender', 'address', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Name is required.')
        return value.strip()

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError(
                'Phone number must be exactly 10 digits.'
            )
        return value

    def validate_year(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                'Year must be between 1 and 5.'
            )
        return value

    def validate_email(self, value):
        qs = Student.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                'A student with this email already exists.'
            )
        return value
