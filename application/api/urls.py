from django.conf.urls.defaults import *
from piston.resource import Resource
from api.handlers import *

path_handler = Resource(PathHandler)
user_handler = Resource(UserHandler)
point_handler = Resource(PointHandler)
user_path_handler = Resource(UserPathHandler)
path_point_handler = Resource(PathPointHandler)
user_googleid_lookup_handler = Resource(UserGoogleIdLookup)

urlpatterns = patterns('',

  url(r'^users[/]$', user_handler),
  url(r'^users/(?P<id>\d+)[/]?$', user_handler),
  url(r'^users/(?P<userId>\d+)/paths[/]?$', user_path_handler),
  url(r'^fetchbygid/(?P<googleId>\d+)[/]?$', user_googleid_lookup_handler),

  url(r'^paths[/]$', path_handler),
  url(r'^paths/(?P<id>\d+)[/]?$', path_handler),
  url(r'^paths/(?P<pathId>\d+)/points[/]?$', path_point_handler),

  url(r'^points[/]$', point_handler),
  url(r'^points/(?P<id>\d+)[/]?$', point_handler),

)
