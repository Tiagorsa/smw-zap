#!/bin/bash
# echo "The script you are running has basename [$( basename -- "$0"; )], dirname $SOURCE";
# echo "The present working directory is $( pwd; )"
SOURCE="$( dirname -- "$0"; )"
source $SOURCE/urlencode.sh

url='https://opl-smw.sa.ngrok.io'
api_user="api:smw1329"

curl -u $api_user \
       -X GET \
       -H "Content-Type: application/json" \
       $url/_/api/lojas

echo ""