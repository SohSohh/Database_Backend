from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer to use email for authentication"""
    username_field = User.EMAIL_FIELD

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """Create new user with encrypted password"""
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data - used for profile views"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type')
        read_only_fields = ('email', 'user_type')  # Only superusers can change user_type

class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer that allows dynamic field selection"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type')

    def __init__(self, *args, **kwargs):
        # Get fields from request query params
        fields = kwargs.pop('fields', None)
        super(UserDetailSerializer, self).__init__(*args, **kwargs)

        if fields:
            # Drop any fields that are not specified in the fields parameter
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)