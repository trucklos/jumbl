from piston.handler import BaseHandler
from geo.models import User, Path, Point

class UserHandler(BaseHandler):
  model = User
  fields = ('id', 'username', ('paths', ('id','description'), ), ) 

class PathHandler(BaseHandler):
  model = Path
  fields = ( 'id','description', ('points',('id','time','lat','lon','description'), ), )

class PointHandler(BaseHandler):
  allowed_methods = ('GET', 'POST', 'PUT', 'DELETE')
  model = Point
  fields = ( 'id','lat','lon','time','description',)

class UserPathHandler(BaseHandler):
  def read(self, request, userId):
    if userId != None:
      return Path.objects.get(user__pk__exact=userId)

class PathPointHandler(BaseHandler):
  def read(self, request, pathId):
    if pathId != None:
      return Point.objects.filter(path__pk__exact=pathId)
