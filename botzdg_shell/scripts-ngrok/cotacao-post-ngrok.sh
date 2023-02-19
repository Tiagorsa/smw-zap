#!/bin/bash
SOURCE="$( dirname -- "$0"; )"
source $SOURCE/urlencode.sh

# url='http://localhost:3030' 
#  https://opl-smw.sa.ngrok.io/_/theme/pdfs/cotacao/cot-01-00805038448.pdf
url='https://opl-smw.sa.ngrok.io'
api_user="api:smw1329"

pFilial=1
pCotacao=${1-805038448}
echo "Busca cotação: $pFilial-$pCotacao"
curl -u $api_user \
       -X POST \
       -H "Content-Type: application/json" \
       -d '{"User":"91984245276"}' \
       $url/_/api/search_cotacao/$pFilial/$pCotacao


echo ""