from django.db import models
from django.contrib import admin

class User(models.Model):
   username = models.CharField(max_length=255, unique = True)
   email = models.CharField(max_length=255)
   googleid = models.CharField(max_length=255, unique = True)
   def __unicode__(self):
       return u'%s' % (self.username, self.email, self.googleid)

class Path(models.Model):
   user = models.ForeignKey(User, related_name='paths')
   description = models.CharField("Path description", max_length=512)
   def __unicode__(self):
       return u'%s - %s' % (self.user.username, self.description)

class Point(models.Model):
   path = models.ForeignKey(Path, related_name='points')
   time = models.DateTimeField()
   lat = models.FloatField()
   lon = models.FloatField()
   description = models.CharField("Point description", max_length=512)
   def __unicode__(self):
       return u'%s - %s' % (str(self.time), str(self.path.description))

admin.site.register(User)
admin.site.register(Path)
admin.site.register(Point)
