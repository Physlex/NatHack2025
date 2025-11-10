from django.contrib import admin
from .models import RecordingSession, TimeSeriesEntry

# Register your models here.
@admin.register(RecordingSession)
class RecordingSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(TimeSeriesEntry)
class TimeSeriesEntryAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'session', 'value')
