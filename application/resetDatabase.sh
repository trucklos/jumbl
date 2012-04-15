#!/bin/bash
echo "drop database geothang; create database geothang;" | ./manage.py dbshell
./manage.py syncdb
