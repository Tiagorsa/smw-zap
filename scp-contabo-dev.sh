#!/bin/bash
path="$1"
if [ -f $path ]; then
# hhmm=`date +%H%M`
# sed -i "s/ rev-[0-9][0-9][0-9][0-9]/ rev-$hhmm/g" $path
echo "Copying $path"
sshpass -p "Aths2005." scp -r ./$path deployzdg@185.192.96.243:$path
else 
echo "ERROR: File [$path] not found!"
fi

# scp -r ./$path deplyzdg@185.192.96.243:$path
