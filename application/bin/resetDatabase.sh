#!/bin/bash
echo "you probably don't actually want to do this"
exit 0
echo "drop database geothang; create database geothang;" | ./manage.py dbshell
../manage.py syncdb
