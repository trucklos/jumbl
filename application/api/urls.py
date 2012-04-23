from django.conf.urls.defaults import *
from piston.resource import Resource
from api.handlers import *

path_handler = Resource(PathHandler)
user_handler = Resource(UserHandler)
point_handler = Resource(PointHandler)
user_path_handler = Resource(UserPathHandler)
path_point_handler = Resource(PathPointHandler)

urlpatterns = patterns('',

  url(r'^users[/]$', user_handler),
  url(r'^user/(?P<id>\d+)[/]$', user_handler),
  url(r'^user/(?P<userId>\d+)/paths[/]$', user_path_handler),

  url(r'^paths[/]$', path_handler),
  url(r'^path/(?P<id>\d+)[/]$', path_handler),
  url(r'^path/(?P<pathId>\d+)/points[/]$', path_point_handler),

  url(r'^points[/]$', point_handler),
  url(r'^point/(?P<id>\d+)[/]$', point_handler),
)
