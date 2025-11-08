from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.views import APIView
class TimeSeriesEndpointView(APIView):
    def get(self, request):

        return JsonResponse({"hello": "world"})
    
    def post(self, request):
        data = request.data
        return JsonResponse({"received_data": data})



# Create your views here.
