from django.db import models
from django.conf import settings
import uuid

# Create your models here.

class RecordingSession(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    
class TimeSeriesEntry(models.Model):
    id = models.AutoField(primary_key=True)
    frequency = models.FloatField()
    session = models.ForeignKey(RecordingSession, on_delete=models.CASCADE, related_name='entries', default=None)
    value = models.FloatField()

    def __str__(self):
        return f"{self.frequency}: {self.value}"