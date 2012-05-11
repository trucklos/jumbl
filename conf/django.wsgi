import os, sys
sys.path.append('/srv/www/mapthing.carlos.ag/application/')
os.environ['DJANGO_SETTINGS_MODULE'] = 'mapthing.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
