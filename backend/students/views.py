from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Student
from .serializers import StudentSerializer


@api_view(['GET', 'POST'])
def student_list(request):
    """
    GET  /api/students/        -> list all students (supports ?search=)
    POST /api/students/        -> create a new student
    """
    if request.method == 'GET':
        queryset = Student.objects.all()
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(department__icontains=search)
            )
        serializer = StudentSerializer(queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Student created successfully', 'data': serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def student_detail(request, pk):
    """
    GET    /api/students/<id>/  -> retrieve one student
    PUT    /api/students/<id>/  -> full update
    PATCH  /api/students/<id>/  -> partial update
    DELETE /api/students/<id>/  -> delete
    """
    try:
        student = Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    if request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = StudentSerializer(student, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Student updated successfully', 'data': serializer.data}
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        student.delete()
        return Response(
            {'message': 'Student deleted successfully'},
            status=status.HTTP_204_NO_CONTENT,
        )
