from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Handler, Viewer, Membership

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer to use email for authentication"""
    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user_type to response
        data['user_type'] = self.user.user_type
        return data

class ViewerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Viewer
        fields = ('username', 'first_name', 'last_name')
        extra_kwargs = {
            'username': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

class HandlerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Handler
        fields = ('username', 'society_name')
        extra_kwargs = {
            'username': {'required': False},
            'society_name': {'required': False}
        }
class BaseUserSerializer(serializers.ModelSerializer):
    """Base serializer with dynamic field filtering"""
    total_comments = serializers.IntegerField(read_only=True, required=False)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super(BaseUserSerializer, self).__init__(*args, **kwargs)

        if fields:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class HandlerSerializer(BaseUserSerializer):
    member_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Handler
        fields = ('id', 'username', 'email', 'user_type', 'society_name', 'join_code', 'member_count', 'total_comments')
        read_only_fields = ('email', 'user_type', 'join_code', 'total_comments')


class ViewerSerializer(BaseUserSerializer):
    class Meta:
        model = Viewer
        fields = ('id', 'username', 'email', 'user_type', 'first_name', 'last_name', 'total_comments')
        read_only_fields = ('email', 'user_type', 'total_comments')


class ViewerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Viewer
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return Viewer.objects.create_user(**validated_data)


class HandlerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Handler
        fields = ('username', 'email', 'password', 'password2', 'society_name')
        extra_kwargs = {
            'email': {'required': True},
            'society_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = Handler.objects.create_user(**validated_data)
        user.generate_code()
        return user


class MembershipSerializer(serializers.ModelSerializer):
    viewer_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = Membership
        fields = ('id', 'viewer', 'handler', 'role', 'role_display', 'viewer_name')

    def get_viewer_name(self, obj):
        return str(obj.viewer)

    def get_role_display(self, obj):
        return obj.get_role_display()

class MemberWithRoleSerializer(ViewerSerializer):
    role = serializers.CharField(source='society_memberships__role', read_only=True)
    role_display = serializers.CharField(source='society_memberships__get_role_display', read_only=True)

    class Meta(ViewerSerializer.Meta):
        fields = ViewerSerializer.Meta.fields + ('role', 'role_display')

class SocietyMembershipSerializer(serializers.Serializer):
    handler_id = serializers.IntegerField(required=True)
    join_code = serializers.CharField(required=True, max_length=5)
    role = serializers.CharField(required=False, default=Membership.OTHER)

    def validate(self, attrs):
        try:
            handler = Handler.objects.get(id=attrs['handler_id'])
            if handler.join_code != attrs['join_code']:
                raise serializers.ValidationError({"join_code": "Invalid join code for this society."})

            # Validate role
            role = attrs.get('role', Membership.OTHER)
            valid_roles = [choice[0] for choice in Membership.ROLE_CHOICES]
            if role not in valid_roles:
                raise serializers.ValidationError({"role": f"Invalid role. Must be one of: {', '.join(valid_roles)}"})

            attrs['handler'] = handler
        except Handler.DoesNotExist:
            raise serializers.ValidationError({"handler_id": "No society found with this ID."})
        return attrs



class JoinCodeSerializer(serializers.Serializer):
    join_code = serializers.CharField(read_only=True)
