from django.db import models
from django.conf import settings
import uuid

# Create your models here.

class RecordingSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    
class TimeSeriesEntry(models.Model):
    timestamp = models.DateTimeField(primary_key=True)
    session = models.ForeignKey(RecordingSession, on_delete=models.CASCADE, related_name='entries', default=None)
    value = models.FloatField()

    def __str__(self):
        return f"{self.timestamp}: {self.value}"