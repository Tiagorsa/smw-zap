#!/bin/bash
SOURCE="$( dirname -- "$0"; )"
source $SOURCE/urlencode.sh

url='http://localhost:3030'
api_user="api:smw1329"
codprod=${1-"13"}
codfil=${2-"75"}
# https://opl-smw.sa.ngrok.io/_/theme/imagens/no-user-image-icon-26.jpg
# -d '{"SearchProd":"187365","User":"teste"}' \
curl -s -u $api_user \
       -X POST \
       -H "Content-Type: application/json" \
       -d '{"User":"teste","Filial":"75","DTInicio":"27/02/2023"}' \
       $url/_/api/total_rot_111 > data-rot111.json 

cat data-rot111.json | jq -r .external_url

echo ""
