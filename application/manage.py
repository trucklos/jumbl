#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    sys.path.insert(0,'/home/carlos/geothang/geothang')

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "geothang.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
