"""
Views for user authentication and management.
"""
import logging
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .permissions import IsAdminRole

logger = logging.getLogger(__name__)


@extend_schema(tags=['auth'])
class RegisterView(generics.CreateAPIView):
    """
    Register a new user.
    Returns success message - user must login separately.
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description='Registration successful'),
            400: OpenApiResponse(description='Validation error')
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        logger.info(f"New user registered: {user.email}")
        
        # Return success WITHOUT tokens - user must login separately
        return Response({
            'success': True,
            'message': 'Registration successful. Please login to continue.',
            'data': {
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }
        }, status=status.HTTP_201_CREATED)


@extend_schema(tags=['auth'])
class LoginView(generics.GenericAPIView):
    """
    Authenticate user and return JWT tokens.
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    @extend_schema(
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description='Login successful'),
            400: OpenApiResponse(description='Invalid credentials'),
            401: OpenApiResponse(description='Unauthorized')
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        logger.info(f"User logged in: {user.email}")
        
        return Response({
            'success': True,
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }
        }, status=status.HTTP_200_OK)


@extend_schema(tags=['auth'])
class CustomTokenRefreshView(TokenRefreshView):
    """
    Refresh access token using refresh token.
    """
    @extend_schema(
        responses={
            200: OpenApiResponse(description='Token refreshed successfully'),
            401: OpenApiResponse(description='Invalid refresh token')
        }
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'success': True,
                'data': response.data
            })
        return Response({
            'success': False,
            'error': 'Token refresh failed',
            'details': response.data
        }, status=response.status_code)


@extend_schema(tags=['auth'])
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user profile.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
    
    @extend_schema(
        responses={
            200: OpenApiResponse(description='Profile retrieved successfully'),
            401: OpenApiResponse(description='Unauthorized')
        }
    )
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @extend_schema(
        request=UserSerializer,
        responses={
            200: OpenApiResponse(description='Profile updated successfully'),
            400: OpenApiResponse(description='Validation error')
        }
    )
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'success': True,
            'data': UserSerializer(user).data
        })