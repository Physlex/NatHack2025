from django.urls import path
from . import views

app_name = "store"

urlpatterns = [
    # GET/POST /store/endpoint/
    path("endpoint/", views.hello_json, name="endpoint"),
]