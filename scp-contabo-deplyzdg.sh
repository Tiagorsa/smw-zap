#!/bin/bash
path="$1"
if [ -f $path ]; then
hhmm=`date +%H%M`
sed -i "s/ rev-[0-9][0-9][0-9][0-9]/ rev-$hhmm/g" $path
echo "Copying and Update rev-$hhmm on $path"
fi
sshpass -p "Aths2005." scp -r ./$path deployzdg@185.192.96.243:$path

# scp -r ./$path deplyzdg@185.192.96.243:$path
