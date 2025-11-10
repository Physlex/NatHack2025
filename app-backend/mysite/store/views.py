from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.views import APIView


class TimeSeriesEndpointView(APIView):
    
    def get(self, request):
        session =  request.data["sid"]
        print("Session Id:", session)
        return JsonResponse({"hello": session})
    
    def post(self, request):
        data = request.data
        #add to database?
        check_keys = set("segn", "len", "values")
        if set(data.keys()) == check_keys:
            return JsonResponse({"received_data": data, "code": 200})
        else:
            return JsonResponse({"msg": "Incorrect Format", "code": 400})



# Create your views here.
