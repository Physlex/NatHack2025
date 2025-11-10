from django.urls import path
from . import views

app_name = "store"

urlpatterns = [
    # GET: /store/endpoint/<sid>/ - Get data for a specific session
    # POST: /store/endpoint/ - Create new time series entries
    path("endpoint/<int:sid>/", views.TimeSeriesEndpointView.as_view(), name="endpoint_get"),
    path("endpoint/", views.TimeSeriesEndpointView.as_view(), name="endpoint_create"),
]