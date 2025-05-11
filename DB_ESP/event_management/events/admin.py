from django.contrib import admin
from .models import Event, Category, Comment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'created_at')
    list_filter = ('event', 'user')

class EventAttendeeInline(admin.TabularInline):
    model = Event.attendees.through
    extra = 1
    verbose_name = "Attendee"
    verbose_name_plural = "Attendees"
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "customuser":
            kwargs["queryset"] = db_field.related_model.objects.filter(user_type='viewer')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'host', 'date', 'location', 'category')
    list_filter = ('host', 'category')
    filter_horizontal = ('attendees',)
    inlines = [EventAttendeeInline]
    exclude = ('attendees',)  # Remove the attendees field since we're using the inline
    
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "attendees":
            kwargs["queryset"] = db_field.remote_field.model.objects.filter(user_type='viewer')
        return super().formfield_for_manytomany(db_field, request, **kwargs)
