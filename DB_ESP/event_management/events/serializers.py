from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Full Event serializer"""
    host_username = serializers.CharField(source='host.username', read_only=True)

    class Meta:
        model = Event
        fields = (
            'id', 'name', 'host', 'host_username', 'start_time',
            'end_time', 'date', 'location', 'description',
            'banner', 'created_at', 'updated_at'
        )
        read_only_fields = ('host', 'created_at', 'updated_at')

    def create(self, validated_data):
        """Set host as the current user when creating an event"""
        validated_data['host'] = self.context['request'].user
        return super().create(validated_data)


class EventDetailSerializer(serializers.ModelSerializer):
    """Event serializer with dynamic fields"""
    host_username = serializers.CharField(source='host.username', read_only=True)

    class Meta:
        model = Event
        fields = (
            'id', 'name', 'host', 'host_username', 'start_time',
            'end_time', 'date', 'location', 'description',
            'banner', 'created_at', 'updated_at'
        )
        read_only_fields = ('host', 'created_at', 'updated_at')

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


class EventUpdateSerializer(serializers.ModelSerializer):
    """Serializer for partial updates of events"""

    class Meta:
        model = Event
        fields = (
            'name', 'start_time', 'end_time', 'date',
            'location', 'description', 'banner'
        )
        # No need to include host as it can't be changed