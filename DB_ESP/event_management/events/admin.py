from django.contrib import admin
from .models import Event, Category, Comment, Announcement

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'created_at')
    list_filter = ('event', 'user')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'host', 'date', 'location', 'category')
    list_filter = ('host', 'category')

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'host', 'date_made')
    list_filter = ('host',)
    search_fields = ('title', 'description')
