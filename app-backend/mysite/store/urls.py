from django.urls import path
from . import views

app_name = "store"

urlpatterns = [
    # Web form for uploading data
    path("upload/", views.UploadFormView.as_view(), name="upload_form"),
    
    # API endpoints
    path("endpoint/", views.TimeSeriesEndpointViewCreate.as_view(), name="endpoint_create"),
    path("endpoint/<int:sid>/", views.TimeSeriesEndpointView.as_view(), name="endpoint_get"),
    path("sessions/<uuid:uid>/", views.SessionsByUserView.as_view(), name="session_list"),
    path("spectrogram/<int:sid>/", views.SpectrogramView.as_view(), name="spectrogram"),
    path("spectrogram/<int:sid>/erps/", views.ERPView.as_view(), name="erps"),
    path("spectrogram/<int:sid>/mfcc/", views.MFCCView.as_view(), name="mfcc"),
]