from django.urls import path
from . import views

app_name = "store"

urlpatterns = [
    # GET/POST /store/endpoint/
    path("endpoint/", views.TimeSeriesEndpointView.as_view(), name="endpoint"),
]