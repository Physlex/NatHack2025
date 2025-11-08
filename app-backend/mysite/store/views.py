from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_GET
@require_GET
def hello_json(request):
    return JsonResponse({"hello": "world"})

# Create your views here.
