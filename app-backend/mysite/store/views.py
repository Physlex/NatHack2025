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
from django.db.models import Count


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
        check_keys = {"segn", "len", "values", "uid"}
        
        if not set(data.keys()) >= check_keys:
            
            return JsonResponse({"msg": "Incorrect Format", "code": status.HTTP_400_BAD_REQUEST, "keys": list(data.keys())})
                
        try:
            # Get or create the recording session
            session, created = RecordingSession.objects.create(
                defaults={'name': f'New Session {data["segn"]}'},
                user_id=data['uid']
            )
            
            # Create time series entries

            values = [int(x) for x in data.getlist('values')]
            print("here: ", data, values)
            for value in values:
                TimeSeriesEntry.objects.create(
                    timestamp=value[0],
                    session=session,
                    value=value[1]
                )
            
            
            # Bulk create all entries
            # TimeSeriesEntry.objects.bulk_create(entries)
            
            return JsonResponse({
                "msg": "Data saved successfully",
                "session_id": session.id,
                "entries_count": len(values),
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
class SessionsByUserView(APIView):
    """
    Return all recording sessions for a specific user (by user id).
    URL should provide `uid` as a path parameter.
    """
    def get(self, request, uid):
        try:
            sessions_qs = RecordingSession.objects.filter(user__id=uid)
            if not sessions_qs.exists():
                return JsonResponse({
                    "user_id": uid,
                    "sessions_count": 0,
                    "sessions": []
                }, status=status.HTTP_200_OK)
            sessions = list(sessions_qs)
            return JsonResponse({
                "user_id": uid,
                "sessions_count": len(sessions),
                "sessions": sessions
            }, status=status.HTTP_200_OK)
       
        except Exception as e:
            return JsonResponse({
                "msg": f"Server error: {str(e)}",
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)