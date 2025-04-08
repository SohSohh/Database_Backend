# events/serializers.py
from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Full Event serializer"""
    host_username = serializers.CharField(source='host.username', read_only=True)
    attendee_count = serializers.IntegerField(read_only=True)
    is_attending = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = (
            'id', 'name', 'host', 'host_username', 'start_time',
            'end_time', 'date', 'location', 'description',
            'banner', 'created_at', 'updated_at', 'attendee_count',
            'is_attending'
        )
        read_only_fields = ('host', 'created_at', 'updated_at', 'attendee_count')

    def create(self, validated_data):
        """Set host as the current user when creating an event"""
        validated_data['host'] = self.context['request'].user
        return super().create(validated_data)

    def get_is_attending(self, obj):
        """Check if current user is attending"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False


class EventDetailSerializer(serializers.ModelSerializer):
    """Event serializer with dynamic fields"""
    host_username = serializers.CharField(source='host.username', read_only=True)
    attendee_count = serializers.IntegerField(read_only=True)
    is_attending = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = (
            'id', 'name', 'host', 'host_username', 'start_time',
            'end_time', 'date', 'location', 'description',
            'banner', 'created_at', 'updated_at', 'attendee_count',
            'is_attending'
        )
        read_only_fields = ('host', 'created_at', 'updated_at', 'attendee_count')

    def __init__(self, *args, **kwargs):
        # Get fields from request query params
        fields = kwargs.pop('fields', None)
        super(EventDetailSerializer, self).__init__(*args, **kwargs)

        if fields:
            # Drop any fields that are not specified in the fields parameter
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def get_is_attending(self, obj):
        """Check if current user is attending"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False


class EventUpdateSerializer(serializers.ModelSerializer):
    """Serializer for partial updates of events"""

    class Meta:
        model = Event
        fields = (
            'name', 'start_time', 'end_time', 'date',
            'location', 'description', 'banner'
        )
        # No need to include host as it can't be changed


class AttendeeSerializer(serializers.Serializer):
    """Serializer for event attendance actions"""
    action = serializers.ChoiceField(choices=['attend', 'unattend'])

    def validate_action(self, value):
        """Validate the action"""
        if value not in ['attend', 'unattend']:
            raise serializers.ValidationError("Action must be either 'attend' or 'unattend'")
        return value