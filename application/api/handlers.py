from piston.handler import BaseHandler
from geo.models import User, Path, Point

class PathHandler(BaseHandler):
  allowed_methods = ('GET',)
  model = Point
  # fields = ( ('user',('username')) )
  fields = ( 'id','lat','lon','time' )
  def read(self, request, pathId):
    #base = Point.objects
    if pathId != None:
      return { 'path':Path.objects.values('id','description','user__username').get(pk__exact=pathId)
               , 'points':Point.objects.filter(path__pk__exact=pathId)}
