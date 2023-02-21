#!/bin/bash
SOURCE="$( dirname -- "$0"; )"
source $SOURCE/urlencode.sh

url='https://opl-smw.sa.ngrok.io'
api_user="api:smw1329"
codprod=${1-"13"}
codfil=${2-"75"}
# https://opl-smw.sa.ngrok.io/_/theme/imagens/no-user-image-icon-26.jpg
# -d '{"SearchProd":"187365","User":"teste"}' \
curl -s -u $api_user \
       -X POST \
       -H "Content-Type: application/json" \
       -d '{"SearchProd":"'$codprod'","User":"teste","Filial":"75"}' \
       $url/_/api/search_produto | jq -r


echo ""