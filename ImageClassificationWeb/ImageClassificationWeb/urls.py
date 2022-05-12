"""ImageClassificationWeb URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from api.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    url('^$', Index.as_view(), name="home"),
    url("^single$", Index.as_view(), name="single"),
    url("^crop$", Index.as_view(), name="crop"),
    url("^draw$", Index.as_view(), name="draw"),
    url("^about$", Index.as_view(), name="about"),

    path('models/<str:ml_method>', GetModels.as_view(), name="models-all"),
    path("predict/<str:ml_method>/<str:pred_method>", PredictConsumer.as_view(), name='predict'),

    path('single/<str:ml_method>', Index.as_view(), name="single-predict-view"),
    path('crop/<str:ml_method>', Index.as_view(), name="crop-predict-view"),
    path('draw/<str:ml_method>', Index.as_view(), name="draw-predict-view"),

    url('threshold', Threshold.as_view(), name="threshold"),
    url('denoise', Denoise.as_view(), name="denoise"),
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
