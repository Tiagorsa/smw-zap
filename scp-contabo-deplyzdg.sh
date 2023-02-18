#!/bin/bash
path="$1"

sshpass -p "Aths2005." scp -r ./$path deployzdg@185.192.96.243:$path

# scp -r ./$path deplyzdg@185.192.96.243:$path
