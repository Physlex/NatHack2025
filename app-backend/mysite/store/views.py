from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from .models import RecordingSession, TimeSeriesEntry
from datetime import datetime
from django.views.generic import TemplateView
from django.contrib import messages


class UploadFormView(TemplateView):
    template_name = 'store/upload_form.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        try:
            # Get form data
            sid = request.POST.get('sid')
            segn = request.POST.get('segn')
            values_str = request.POST.get('values', '')
            
            # Parse values from comma-separated string
            values = [float(v.strip()) for v in values_str.split(',') if v.strip()]
            
            # Create or get session
            session, created = RecordingSession.objects.get_or_create(
                id=sid,
                defaults={'name': f'Session {sid}'}
            )
            
            # Create entries
            entries = []
            for value in values:
                entry = TimeSeriesEntry(
                    session=session,
                    value=value
                )
                entries.append(entry)
            
            # Bulk create entries
            TimeSeriesEntry.objects.bulk_create(entries)
            
            messages.success(request, f'Successfully uploaded {len(entries)} values for session {sid}')
            return redirect('store:upload_form')
            
        except ValueError as e:
            messages.error(request, 'Invalid data format: Please check your values are valid numbers')
        except Exception as e:
            messages.error(request, f'Error uploading data: {str(e)}')
        
        return render(request, self.template_name)


class TimeSeriesEndpointView(APIView):
    
    def get(self, request, sid):
        session = get_object_or_404(RecordingSession, id=sid)
        entries = session.entries.all().values('timestamp', 'value')
        return JsonResponse({"session_id": sid, "entries": list(entries)})

    def post(self, request):
        data = request.data
        check_keys = {"segn", "len", "values", "sid"}
        
        if not set(data.keys()) >= check_keys:
            return JsonResponse({"msg": "Incorrect Format", "code": status.HTTP_400_BAD_REQUEST})
            
        try:
            # Get or create the recording session
            session, created = RecordingSession.objects.get_or_create(
                id=data['sid'],
                defaults={'name': f'Session {data["sid"]}'}
            )
            
            # Create time series entries
            entries = []
            values = data['values']
            
            for value in values:
                entry = TimeSeriesEntry(
                    session=session,
                    value=float(value)
                )
                entries.append(entry)
            
            # Bulk create all entries
            TimeSeriesEntry.objects.bulk_create(entries)
            
            return JsonResponse({
                "msg": "Data saved successfully",
                "session_id": session.id,
                "entries_count": len(entries),
                "code": status.HTTP_201_CREATED
            })
        except (ValueError, TypeError) as e:
            return JsonResponse({
                "msg": f"Invalid data format: {str(e)}",
                "code": status.HTTP_400_BAD_REQUEST
            })
        except Exception as e:
            return JsonResponse({
                "msg": f"Server error: {str(e)}",
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR
            })



# Create your views here.
