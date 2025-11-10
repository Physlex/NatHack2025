from django.urls import path
from . import views

app_name = "store"

urlpatterns = [
    # GET/POST /store/endpoint/
    
    path("endpoint/<int:sid>/", views.TimeSeriesEndpointView.as_view(), name="endpoint_get"),
    path("endpoint/create/", views.TimeSeriesEndpointView.as_view(), name="endpoint_create"),
]