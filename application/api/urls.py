from django.conf.urls.defaults import *
from piston.resource import Resource
from api.handlers import PathHandler

path_handler = Resource(PathHandler)

urlpatterns = patterns('',
   url(r'^path/(?P<pathId>\d+)(\.(?P<emitter_format>.+))$', path_handler),
)
