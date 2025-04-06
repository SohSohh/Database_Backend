from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'host', 'date', 'location')
    list_filter = ('date', 'host')
    search_fields = ('name', 'description', 'location')
    date_hierarchy = 'date'