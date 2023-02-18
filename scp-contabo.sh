#!/bin/bash
path="$1"

scp -r ./$path root@185.192.96.243:$path
