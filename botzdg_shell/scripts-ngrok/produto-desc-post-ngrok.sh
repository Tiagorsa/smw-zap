#!/bin/bash
SOURCE="$( dirname -- "$0"; )"
source $SOURCE/urlencode.sh

url='https://opl-smw.sa.ngrok.io'
api_user="api:smw1329"
descricao=${1-"furad vonder"}
# https://opl-smw.sa.ngrok.io/_/theme/imagens/no-user-image-icon-26.jpg
# -d '{"SearchProd":"187365","User":"teste"}' \
curl -u $api_user \
       -X POST \
       -H "Content-Type: application/json" \
       -d '{"SearchProd":"furad vonder","User":"teste"}' \
       $url/_/api/search_produto

       #      Default 'Filial':1 'Almox':1

echo ""