from django.db import models
from django.contrib import admin

class User(models.Model):
   username = models.CharField(max_length=256)
   def __unicode__(self):
       return u'%s' % self.username

class Path(models.Model):
   user = models.ForeignKey(User)
   description = models.CharField("Path description", max_length=512)
   def __unicode__(self):
       return u'%s - %s' % (self.user.username, self.description)

class Point(models.Model):
   path = models.ForeignKey(Path)
   time = models.DateTimeField()
   lat = models.FloatField()
   lon = models.FloatField()
   def __unicode__(self):
       return u'%s - %s' % (str(self.time), str(self.path.description))

admin.site.register(User)
admin.site.register(Path)
admin.site.register(Point)
