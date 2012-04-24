#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    # Carlos added this to work around a strange error where manage.py can't find settings
    djangoPath = os.path.split(os.path.realpath(__file__))[0] + '/geothang'
    sys.path.insert(0, djangoPath)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "geothang.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
