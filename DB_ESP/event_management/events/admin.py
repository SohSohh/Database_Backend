from django.contrib import admin
from .models import Event, Category, Comment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'created_at')
    list_filter = ('event', 'user', 'created_at')
    search_fields = ('content',)
    date_hierarchy = 'created_at'

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'host', 'date', 'location', 'category')
    list_filter = ('date', 'host', 'category')
    search_fields = ('name', 'description', 'location')
    date_hierarchy = 'date'