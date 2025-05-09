# events/serializers.py
from rest_framework import serializers
from .models import Event, Category, Comment, Announcement
import users


class BaseEventSerializer(serializers.ModelSerializer):
    """Base serializer with dynamic field filtering"""

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super(BaseEventSerializer, self).__init__(*args, **kwargs)

        if fields:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class EventSerializer(BaseEventSerializer):
    host_username = serializers.CharField(source='host.username', read_only=True)
    attendee_count = serializers.IntegerField(read_only=True)
    is_attending = serializers.SerializerMethodField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Event
        fields = (
            'id', 'name', 'host', 'host_username', 'start_time',
            'end_time', 'date', 'location', 'description',
            'banner', 'created_at', 'updated_at', 'attendee_count',
            'is_attending', 'category', 'category_name', 'average_rating'
        )
        read_only_fields = ('host', 'host_username', 'created_at', 'updated_at', 'attendee_count', 'average_rating')

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


class EventDetailSerializer(BaseEventSerializer):
    """Event serializer with dynamic fields"""
    host_username = serializers.CharField(source='host.username', read_only=True)
    attendee_count = serializers.IntegerField(read_only=True)
    is_attending = serializers.SerializerMethodField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)  # Added field

    class Meta:
        model = Event
        fields = (
            'id', 'name', 'host', 'host_username', 'start_time',
            'end_time', 'date', 'location', 'description',
            'banner', 'created_at', 'updated_at', 'attendee_count',
            'is_attending', 'average_rating', 'category', 'category_name'  # Added category_name
        )
        read_only_fields = ('host', 'created_at', 'updated_at', 'attendee_count', 'average_rating')

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

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories"""

    class Meta:
        model = Category
        fields = ('id', 'name', 'description')


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments"""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'event', 'user', 'user_username', 'content', 'rating', 'created_at', 'updated_at')
        read_only_fields = ('event', 'user', 'created_at', 'updated_at')

    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def validate(self, data):
        """Validate that the event has ended before allowing a comment"""
        # In create operations, event_id comes from URL and is added later
        # So we need to check the event from the context
        request = self.context.get('request')
        view = self.context.get('view')

        if request and request.method == 'POST' and view:
            event_id = view.kwargs.get('pk')
            try:
                event = Event.objects.get(pk=event_id)
                if not event.has_ended():
                    raise serializers.ValidationError(
                        {"event": "Comments can only be added after the event has ended."}
                    )
            except Event.DoesNotExist:
                # Let the view handle this error
                pass

        return data

    def create(self, validated_data):
        """Set user as the current user when creating a comment"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AnnouncementSerializer(serializers.ModelSerializer):
    host_username = serializers.CharField(source='host.username', read_only=True)

    class Meta:
        model = Announcement
        fields = ('id', 'title', 'host', 'host_username', 'date_made', 'description', 'updated_at')
        read_only_fields = ('host', 'date_made', 'updated_at')
